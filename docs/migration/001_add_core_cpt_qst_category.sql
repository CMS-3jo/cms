-- Adds CATEGORY_CD column to CORE_CPT_QST to track competency per question
ALTER TABLE CORE_CPT_QST
    ADD COLUMN CATEGORY_CD VARCHAR(20);

-- Populate new column using survey's competency code
UPDATE CORE_CPT_QST q
JOIN CORE_CPT_INFO i ON q.CCI_ID = i.CCI_ID
SET q.CATEGORY_CD = i.CATEGORY_CD
WHERE q.CATEGORY_CD IS NULL;

-- Enforce non-null constraint
ALTER TABLE CORE_CPT_QST
    MODIFY CATEGORY_CD VARCHAR(20) NOT NULL;
