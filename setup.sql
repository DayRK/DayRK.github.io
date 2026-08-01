-- Create the portfolio database
CREATE DATABASE IF NOT EXISTS portfolio;
USE portfolio;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  stack JSON NOT NULL,
  link VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id INT PRIMARY KEY DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'Open to Commissions',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial availability status
INSERT IGNORE INTO availability (id, status) VALUES (1, 'Open to Commissions');

-- Insert sample projects
INSERT INTO projects (title, summary, stack, link) VALUES
('Aurora Finance', 'A secure analytics platform with a polished experience and modern architecture.', '["Next.js", "TypeScript", "Design Systems"]', 'https://example.com/aurora-finance'),
('Northwind Commerce', 'An e-commerce experience focused on conversion, accessibility, and performance.', '["React", "Tailwind", "Accessibility"]', 'https://example.com/northwind-commerce'),
('Lumen Health', 'A patient-first web product designed to simplify complex workflows and improve trust.', '["UX Strategy", "Frontend", "Product Design"]', 'https://example.com/lumen-health');
