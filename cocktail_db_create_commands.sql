-- DROP DATABASE cocktail_db;

CREATE DATABASE IF NOT EXISTS cocktail_db;
USE cocktail_db;


CREATE TABLE recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    instructions LONGTEXT NOT NULL,
    difficulty ENUM('Simple', 'Complex') NOT NULL
);

CREATE TABLE tool (
    tool_id INT AUTO_INCREMENT PRIMARY KEY,
    tool_name VARCHAR(100) NOT NULL,
    tool_description TEXT,
    tool_image_url VARCHAR(256) NULL
);

CREATE TABLE ingredient_type (
    ingred_type_id INT AUTO_INCREMENT PRIMARY KEY,
    ingred_type_name VARCHAR(100) NOT NULL UNIQUE,
    ingred_type_description TEXT NULL
);

CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL UNIQUE,
    ingredient_description TEXT NULL,
    ingred_type_id INT NOT NULL,
    FOREIGN KEY (ingred_type_id) REFERENCES ingredient_type(ingred_type_id)
);

-- Relationship Table for recipe <-> tool (M:N "needs")
CREATE TABLE recipe_tool (
    recipe_id INT NOT NULL,
    tool_id INT NOT NULL,
    PRIMARY KEY (recipe_id, tool_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id)
);

-- Relationship Table for recipe <-> ingredient (M:N "needs")
CREATE TABLE recipe_ingredient (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(100), 
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
);

CREATE TABLE glass_type (
    glass_type_id INT AUTO_INCREMENT PRIMARY KEY,
    glass_type_name VARCHAR(100) NOT NULL,
    glass_type_description TEXT NULL,
    glass_type_image_url VARCHAR(255) NULL
);

CREATE TABLE cocktail (
	cocktail_id INT AUTO_INCREMENT PRIMARY KEY,
    cocktail_name VARCHAR(128) NOT NULL UNIQUE,
    cocktail_description TEXT NULL,
    cocktail_image_url VARCHAR(256),
    recipe_id INT NOT NULL UNIQUE,
    glass_type_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
    FOREIGN KEY (glass_type_id) REFERENCES glass_type(glass_type_id)
);

CREATE TABLE flavor (
    flavor_id INT AUTO_INCREMENT PRIMARY KEY,
    flavor_name VARCHAR(100) NOT NULL UNIQUE,
    flavor_description TEXT NULL
);

-- Relationship Table for cocktail <-> flavor (M:N "tags")
CREATE TABLE cocktail_flavor (
    cocktail_id INT NOT NULL,
    flavor_id INT NOT NULL,
    PRIMARY KEY (cocktail_id, flavor_id),
    FOREIGN KEY (cocktail_id) REFERENCES cocktail(cocktail_id),
    FOREIGN KEY (flavor_id) REFERENCES flavor(flavor_id)
);

CREATE TABLE app_user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    cocktail_id INT NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating BETWEEN 0 AND 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, cocktail_id),
    FOREIGN KEY (cocktail_id) REFERENCES cocktail(cocktail_id),
    FOREIGN KEY (user_id) REFERENCES app_user(user_id)
);

-- Relationship Table for app_user <-> cocktail (M:N "favorites")
CREATE TABLE user_favorite (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cocktail_id INT NOT NULL,
    UNIQUE (user_id, cocktail_id),
    FOREIGN KEY (user_id) REFERENCES app_user(user_id),
    FOREIGN KEY (cocktail_id) REFERENCES cocktail(cocktail_id)
);