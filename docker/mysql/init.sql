-- Initialize WFH Portal MySQL Databases
CREATE DATABASE IF NOT EXISTS wfh_employee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS wfh_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions to wfh_user
GRANT ALL PRIVILEGES ON wfh_employee.* TO 'wfh_user'@'%';
GRANT ALL PRIVILEGES ON wfh_attendance.* TO 'wfh_user'@'%';
FLUSH PRIVILEGES;
