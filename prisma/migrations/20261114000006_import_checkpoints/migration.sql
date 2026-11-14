CREATE TABLE import_checkpoints (
  stage text PRIMARY KEY,
  completed_at timestamptz NOT NULL DEFAULT now()
);
