# Database Migration Scripts

This folder contains SQL scripts for manual database updates.

## Adding per-question competency

Run `001_add_core_cpt_qst_category.sql` on your MySQL database to add the `CATEGORY_CD` column to `CORE_CPT_QST`. This column stores the competency code for each question.

Execute the script in order:

```sql
source docs/migration/001_add_core_cpt_qst_category.sql;
```

The script populates existing rows from `CORE_CPT_INFO.CATEGORY_CD` and then applies a NOT NULL constraint.
