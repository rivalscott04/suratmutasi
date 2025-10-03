-- Add foreign key constraint to maintenance table
-- This should be run after the maintenance table is created

-- First, check if the constraint already exists
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'maintenance' 
    AND CONSTRAINT_NAME = 'fk_maintenance_created_by'
);

-- Only add the constraint if it doesn't exist
SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE maintenance ADD CONSTRAINT fk_maintenance_created_by FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "Foreign key constraint already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
