"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface Card {
  id: number;
  title: string;
  image?: string;
  content: ReactNode;
  author?: {
    name: string;
    role: string;
    image: string;
  };
}

// Smoother ease-out curve for less abrupt motion
const smoothEasing: number[] = [0.22, 0.61, 0.36, 1];

export interface ExpandableCardsProps {
  cards?: Card[];
  selectedCard?: number | null;
  onSelect?: (id: number | null) => void;
  className?: string; // Allow passing grid classes from parent
  cardClassName?: string;
  totalCols?: number; // grid columns (desktop)
  expandedSpan?: number; // span for active card
  collapsedSpan?: number; // explicit span for non-active cards
}

export default function ExpandableCards({
  cards = [],
  selectedCard: controlledSelected,
  onSelect,
  className = "",
  cardClassName = "",
  totalCols = 12,
  expandedSpan = 8,
  collapsedSpan,
}: ExpandableCardsProps) {
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const selectedCard =
    controlledSelected !== undefined ? controlledSelected : internalSelected;

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Ensure selected card is scrolled into view (useful on smaller screens)
    if (selectedCard != null) {
      const el = document.querySelector(`[data-card-id="${selectedCard}"]`);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [selectedCard]);

  const handleCardClick = (id: number) => {
    if (selectedCard === id) {
      if (onSelect) onSelect(null);
      else setInternalSelected(null);
    } else {
      if (onSelect) onSelect(id);
      else setInternalSelected(id);
    }
  };

  const collapsedWidth = 240;
  const expandedWidth = 520;

  // Compute col-span per card
  const getSpanForIndex = (idx: number): number => {
    if (selectedCard == null) {
      // Evenly distribute across grid by default
      const base = Math.max(1, Math.floor(totalCols / Math.max(1, cards.length)));
      return base;
    }
    if (cards[idx].id === selectedCard) return Math.min(expandedSpan, totalCols);
    if (collapsedSpan && collapsedSpan > 0) return Math.min(collapsedSpan, totalCols);
    const others = cards.length - 1;
    const remaining = Math.max(0, totalCols - Math.min(expandedSpan, totalCols));
    const collapsedBase = Math.max(1, Math.floor(remaining / Math.max(1, others)));
    const remainder = remaining - collapsedBase * others;
    // Distribute remainder to first few items (excluding selected)
    // Build an order map without selected index
    const order = cards
      .map((c, i) => i)
      .filter((i) => cards[i].id !== selectedCard);
    const pos = order.indexOf(idx);
    return collapsedBase + (pos >= 0 && pos < remainder ? 1 : 0);
  };

  return (
    <div
      className={`grid ${className}`}
      ref={listRef}
      style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          layout
          data-card-id={card.id}
          className={`relative overflow-hidden rounded-xl border bg-background shadow-sm transition-shadow ${cardClassName}`}
          onClick={() => handleCardClick(card.id)}
          whileHover={{ boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}
          transition={{ duration: 0.7, ease: smoothEasing as any }}
          style={{ gridColumn: `span ${getSpanForIndex(i)} / span ${getSpanForIndex(i)}` }}
        >
          <div className="p-4 cursor-pointer select-none">
            <div className="text-sm font-semibold truncate" title={card.title}>
              {card.title}
            </div>
          </div>
          <AnimatePresence mode="popLayout">
            {selectedCard === card.id && (
              <motion.div
                key={`content-${card.id}`}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: smoothEasing as any }}
                className="border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.35, ease: smoothEasing as any, delay: 0.15 }}
                >
                  {card.content}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}


