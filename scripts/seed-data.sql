-- Weekly Planner Database Seed Script
-- Run this after applying migrations to populate initial test data

-- Create test users
INSERT INTO "Users" (id, name, email, role, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@example.com', 2, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 'bob@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Charlie Brown', 'charlie@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'David Wilson', 'david@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Emma Davis', 'emma@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Frank Miller', 'frank@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Grace Lee', 'grace@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Henry Taylor', 'henry@example.com', 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', 'Isabella Anderson', 'isabella@example.com', 1, NOW());

-- Create backlog items - Client Focused
INSERT INTO "BacklogItems" (id, title, description, category, estimated_hours, is_archived, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'Fix user login bug', 'Users cannot login after password reset', 1, 8, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440102', 'Implement dark mode', 'Add dark mode theme to application', 1, 13, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440103', 'Add export to PDF', 'Export planning reports to PDF format', 1, 10, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440104', 'Improve search performance', 'Optimize database queries for search', 1, 6, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440105', 'Mobile responsive design', 'Make planning app mobile-friendly', 1, 20, FALSE, NOW());

-- Create backlog items - Tech Debt
INSERT INTO "BacklogItems" (id, title, description, category, estimated_hours, is_archived, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440201', 'Refactor authentication', 'Migrate from custom auth to OAuth2', 2, 16, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440202', 'Update dependencies', 'Update all NuGet packages to latest', 2, 8, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440203', 'Add logging framework', 'Implement Serilog for structured logging', 2, 6, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440204', 'Database indexing', 'Add missing database indexes', 2, 5, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440205', 'Unit test coverage', 'Improve code coverage to 100%', 2, 24, FALSE, NOW());

-- Create backlog items - RnD
INSERT INTO "BacklogItems" (id, title, description, category, estimated_hours, is_archived, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440301', 'Explore GraphQL', 'Research GraphQL for API optimization', 3, 12, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440302', 'Machine learning POC', 'POC for task classification using ML', 3, 20, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440303', 'WebSocket real-time updates', 'Research real-time update implementation', 3, 8, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440304', 'Cloud cost optimization', 'Analyze and optimize Azure costs', 3, 6, FALSE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440305', 'Performance testing', 'Load testing and performance profiling', 3, 14, FALSE, NOW());
