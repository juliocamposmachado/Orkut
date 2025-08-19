-- Create the instruments table as per Supabase documentation
CREATE TABLE IF NOT EXISTS instruments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL
);

-- Insert some sample data (simple approach)
INSERT INTO instruments (name) VALUES ('violin');
INSERT INTO instruments (name) VALUES ('viola');
INSERT INTO instruments (name) VALUES ('cello');
