-- ============================================================
-- MixMaster: Stored Functions, Procedures, Triggers & Events
-- Run this AFTER the create + populate scripts.
-- ============================================================

USE cocktail_db;

-- ============================================================
-- Drop existing objects if re-running
-- ============================================================
DROP FUNCTION  IF EXISTS fn_avg_rating;
DROP FUNCTION  IF EXISTS fn_cocktail_review_count;
DROP FUNCTION  IF EXISTS fn_user_favorite_count;
DROP PROCEDURE IF EXISTS sp_submit_review;
DROP PROCEDURE IF EXISTS sp_update_review;
DROP PROCEDURE IF EXISTS sp_register_user;
DROP PROCEDURE IF EXISTS sp_get_cocktail_stats;

-- Triggers must be dropped individually (no IF EXISTS on some MySQL versions)
DROP TRIGGER IF EXISTS trg_review_rating_check;
DROP TRIGGER IF EXISTS trg_review_rating_check_update;
DROP TRIGGER IF EXISTS trg_cascade_delete_user_reviews;
DROP TRIGGER IF EXISTS trg_cascade_delete_user_favorites;

DROP EVENT IF EXISTS evt_cleanup_orphan_favorites;


-- ============================================================
-- 1. USER-DEFINED FUNCTIONS
-- ============================================================

-- fn_avg_rating: Returns the average rating for a given cocktail.
-- Returns NULL if the cocktail has no reviews.
DELIMITER //
CREATE FUNCTION fn_avg_rating(p_cocktail_id INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE avg_val DECIMAL(3,2);
    SELECT AVG(rating) INTO avg_val
    FROM review
    WHERE cocktail_id = p_cocktail_id;
    RETURN avg_val;
END //
DELIMITER ;


-- fn_cocktail_review_count: Returns total number of reviews for a cocktail.
DELIMITER //
CREATE FUNCTION fn_cocktail_review_count(p_cocktail_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt
    FROM review
    WHERE cocktail_id = p_cocktail_id;
    RETURN cnt;
END //
DELIMITER ;


-- fn_user_favorite_count: Returns how many cocktails a user has favorited.
DELIMITER //
CREATE FUNCTION fn_user_favorite_count(p_user_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt
    FROM user_favorite
    WHERE user_id = p_user_id;
    RETURN cnt;
END //
DELIMITER ;


-- ============================================================
-- 2. STORED PROCEDURES
-- ============================================================

-- sp_submit_review: Creates a new review with full server-side validation.
-- Checks: cocktail exists, user exists, no duplicate review, rating in range.
-- Returns the newly created review row.
DELIMITER //
CREATE PROCEDURE sp_submit_review(
    IN  p_cocktail_id INT,
    IN  p_user_id     INT,
    IN  p_rating      DECIMAL(2,1),
    IN  p_review_text TEXT
)
BEGIN
    -- Validate cocktail exists
    IF NOT EXISTS (SELECT 1 FROM cocktail WHERE cocktail_id = p_cocktail_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cocktail not found';
    END IF;

    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM app_user WHERE user_id = p_user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;

    -- Check for duplicate review
    IF EXISTS (SELECT 1 FROM review WHERE cocktail_id = p_cocktail_id AND user_id = p_user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have already reviewed this cocktail';
    END IF;

    -- Validate rating range
    IF p_rating < 0 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 0 and 5';
    END IF;

    -- Insert the review
    INSERT INTO review (cocktail_id, user_id, rating, review_text, created_at)
    VALUES (p_cocktail_id, p_user_id, p_rating, p_review_text, NOW());

    -- Return the newly created review
    SELECT review_id, cocktail_id, user_id, rating, review_text, created_at
    FROM review
    WHERE cocktail_id = p_cocktail_id AND user_id = p_user_id;
END //
DELIMITER ;


-- sp_update_review: Updates an existing review with validation.
-- Returns the updated review row.
DELIMITER //
CREATE PROCEDURE sp_update_review(
    IN  p_review_id   INT,
    IN  p_rating      DECIMAL(2,1),
    IN  p_review_text TEXT
)
BEGIN
    -- Validate review exists
    IF NOT EXISTS (SELECT 1 FROM review WHERE review_id = p_review_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Review not found';
    END IF;

    -- Validate rating range
    IF p_rating < 0 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 0 and 5';
    END IF;

    -- Update the review
    UPDATE review
    SET rating = p_rating, review_text = p_review_text
    WHERE review_id = p_review_id;

    -- Return the updated review
    SELECT review_id, cocktail_id, user_id, rating, review_text, created_at
    FROM review
    WHERE review_id = p_review_id;
END //
DELIMITER ;


-- sp_register_user: Creates a new user account with duplicate checking.
-- Returns the newly created user row.
DELIMITER //
CREATE PROCEDURE sp_register_user(
    IN  p_username      VARCHAR(50),
    IN  p_email         VARCHAR(255),
    IN  p_password_hash VARCHAR(255)
)
BEGIN
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already taken';
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM app_user WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already taken';
    END IF;

    -- Insert the new user
    INSERT INTO app_user (username, email, password_hash)
    VALUES (p_username, p_email, p_password_hash);

    -- Return the newly created user
    SELECT user_id, username, email, password_hash, created_at
    FROM app_user
    WHERE username = p_username;
END //
DELIMITER ;


-- sp_get_cocktail_stats: Returns analytics summary using the stored functions.
-- Demonstrates calling UDFs from within a stored procedure.
DELIMITER //
CREATE PROCEDURE sp_get_cocktail_stats()
BEGIN
    SELECT
        c.cocktail_id,
        c.cocktail_name,
        fn_avg_rating(c.cocktail_id)          AS avg_rating,
        fn_cocktail_review_count(c.cocktail_id) AS review_count
    FROM cocktail c
    ORDER BY avg_rating DESC;
END //
DELIMITER ;


-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- trg_review_rating_check: Enforces rating 0-5 on INSERT.
-- Belt-and-suspenders with the CHECK constraint (which MySQL
-- only enforces from 8.0.16+, and some tools ignore).
DELIMITER //
CREATE TRIGGER trg_review_rating_check
BEFORE INSERT ON review
FOR EACH ROW
BEGIN
    IF NEW.rating < 0 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 0 and 5';
    END IF;
END //
DELIMITER ;


-- trg_review_rating_check_update: Same enforcement on UPDATE.
DELIMITER //
CREATE TRIGGER trg_review_rating_check_update
BEFORE UPDATE ON review
FOR EACH ROW
BEGIN
    IF NEW.rating < 0 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 0 and 5';
    END IF;
END //
DELIMITER ;


-- trg_cascade_delete_user_reviews: When a user is deleted,
-- automatically remove all their reviews.
DELIMITER //
CREATE TRIGGER trg_cascade_delete_user_reviews
BEFORE DELETE ON app_user
FOR EACH ROW
BEGIN
    DELETE FROM review WHERE user_id = OLD.user_id;
END //
DELIMITER ;


-- trg_cascade_delete_user_favorites: When a user is deleted,
-- automatically remove all their favorites.
DELIMITER //
CREATE TRIGGER trg_cascade_delete_user_favorites
BEFORE DELETE ON app_user
FOR EACH ROW
BEGIN
    DELETE FROM user_favorite WHERE user_id = OLD.user_id;
END //
DELIMITER ;


-- ============================================================
-- 4. SCHEDULED EVENT
-- ============================================================

-- Enable the event scheduler (must be ON for events to fire).
SET GLOBAL event_scheduler = ON;

-- evt_cleanup_orphan_favorites: Runs daily at 3 AM.
-- Removes any favorite entries where the cocktail has been deleted
-- (edge case safety net for data integrity).
DELIMITER //
CREATE EVENT evt_cleanup_orphan_favorites
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
    DELETE FROM user_favorite
    WHERE cocktail_id NOT IN (SELECT cocktail_id FROM cocktail);

    DELETE FROM review
    WHERE cocktail_id NOT IN (SELECT cocktail_id FROM cocktail);
END //
DELIMITER ;


-- ============================================================
-- VERIFICATION: Show all created objects
-- ============================================================
SELECT 'Functions' AS object_type, ROUTINE_NAME AS name
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'cocktail_db' AND ROUTINE_TYPE = 'FUNCTION'
UNION ALL
SELECT 'Procedures', ROUTINE_NAME
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'cocktail_db' AND ROUTINE_TYPE = 'PROCEDURE'
UNION ALL
SELECT 'Triggers', TRIGGER_NAME
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'cocktail_db'
UNION ALL
SELECT 'Events', EVENT_NAME
FROM INFORMATION_SCHEMA.EVENTS
WHERE EVENT_SCHEMA = 'cocktail_db';
