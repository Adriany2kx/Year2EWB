-- Run this file to initialize the database
CREATE DATABASE IF NOT EXISTS Synoptic;
USE Synoptic;

-- User table definition
CREATE TABLE IF NOT EXISTS User (
    UserID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(32) NOT NULL UNIQUE CONSTRAINT C_ValidUsername CHECK (Username REGEXP '^[a-zA-Z0-9_]+$'),
    Forename VARCHAR(64) NOT NULL CONSTRAINT C_ValidForename CHECK (Forename REGEXP '^[a-zA-Z-]+$'),
    Surname VARCHAR(64) NOT NULL CONSTRAINT C_ValidSurname CHECK (Surname REGEXP '^[a-zA-Z-]+$'),
    Email VARCHAR(128) NOT NULL UNIQUE CONSTRAINT C_ValidEmail CHECK (Email REGEXP '^.+@.+\..+$'),
    DOB	DATE NULL,
    Password VARCHAR(128) NOT NULL,
    CredibilityPoints INT NOT NULL DEFAULT 0, -- Points gained from volunteering and contributing to the community that can be converted into vouchers
    Role ENUM('User', 'Employer', 'Moderator') DEFAULT 'User'
);

-- Post table definition
CREATE TABLE IF NOT EXISTS Post (
    PostID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    Title VARCHAR(128) NOT NULL,
    Description TEXT NOT NULL,
    Location VARCHAR(128),
    StartDate DATE,
    ApplyBy DATE,
    Type ENUM('Job', 'Volunteer', 'Workshop') NOT NULL,
    TimeCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User (UserID) ON DELETE CASCADE
);
    
-- Job table definition
CREATE TABLE IF NOT EXISTS Job (
    PostID BIGINT PRIMARY KEY,
    HourlyRate DECIMAL(10,2) NOT NULL,
    Contract ENUM ('Full-time', 'Part-time', 'Temporary') NOT NULL,
    WeeklyHours DECIMAL(10,2),
    FOREIGN KEY (PostID) REFERENCES Post (PostID) ON DELETE CASCADE
);

-- Volunteer table definition
CREATE TABLE IF NOT EXISTS Volunteer (
    PostID BIGINT PRIMARY KEY,
    Date DATE NOT NULL DEFAULT (CURDATE()),
    Points INT,
    FOREIGN KEY (PostID) REFERENCES Post (PostID) ON DELETE CASCADE
);

-- Workshop table definition
CREATE TABLE IF NOT EXISTS Workshop (
    PostID BIGINT PRIMARY KEY,
    Date DATE NOT NULL DEFAULT (CURDATE()),
    RemainingSlots INT, -- If the workshop is fully booked (no slots left), it should not appear
    FOREIGN KEY (PostID) REFERENCES Post (PostID) ON DELETE CASCADE
);

-- Application table definition
CREATE TABLE IF NOT EXISTS Application (
    ApplicationID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    PostID BIGINT NOT NULL,
    DateApplied DATE NOT NULL DEFAULT (CURDATE()),
    Status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (UserID) REFERENCES User (UserID) ON DELETE CASCADE,
    FOREIGN KEY (PostID) REFERENCES Post (PostID) ON DELETE CASCADE,
    CONSTRAINT UQ_Application UNIQUE (UserID, PostID) -- Prevents duplicate applications from user
);