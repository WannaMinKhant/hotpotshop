-- ============================================
-- CLEANUP DUPLICATE STAFF RECORDS
-- ============================================
-- Run this in Supabase SQL Editor to remove
-- duplicate staff entries (keeps the most recent).
-- ============================================

-- Delete duplicates, keeping only the record with the highest ID per email
DELETE FROM staff
WHERE id NOT IN (
  SELECT MAX(id)
  FROM staff
  GROUP BY email
);

-- Verify no duplicates remain
SELECT email, COUNT(*) as count
FROM staff
GROUP BY email
HAVING COUNT(*) > 1;
