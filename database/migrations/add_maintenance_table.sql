-- Create maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    isActive BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    startTime DATETIME,
    endTime DATETIME,
    createdBy VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_maintenance_active ON maintenance(isActive);
CREATE INDEX idx_maintenance_created_at ON maintenance(createdAt);
