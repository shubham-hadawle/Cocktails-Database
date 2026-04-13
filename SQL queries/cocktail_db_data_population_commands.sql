USE cocktail_db;

-- ============================================================
-- DELETE all populated data if previously exists (reverse dependency order).
-- ============================================================
SET SQL_SAFE_UPDATES = 0;

DELETE FROM user_favorite;
DELETE FROM review;
DELETE FROM cocktail_flavor;
DELETE FROM recipe_ingredient;
DELETE FROM recipe_tool;
DELETE FROM cocktail;
DELETE FROM flavor;
DELETE FROM glass_type;
DELETE FROM ingredient;
DELETE FROM ingredient_type;
DELETE FROM tool;
DELETE FROM app_user;
DELETE FROM recipe;

-- ============================================================
-- 1. recipe (no FK dependencies)
-- ============================================================
INSERT INTO recipe (recipe_id, instructions, difficulty) VALUES
(101, 'Muddle mint leaves and sugar in a glass. Add lime juice, fill with crushed ice, pour in white rum, and top with soda water. Stir gently and garnish with a sprig of mint.', 'Simple'),
(102, 'Combine tequila, lime juice, and triple sec in a shaker with ice. Shake vigorously, then strain into a salt-rimmed glass over fresh ice.', 'Simple'),
(103, 'Stir bourbon, sugar syrup, and Angostura bitters with ice in a mixing glass until well chilled. Strain into a rocks glass over a large ice cube and garnish with an orange peel.', 'Simple'),
(104, 'Shake vodka, coffee liqueur, and fresh espresso with ice until frothy. Double-strain into a chilled coupe glass and garnish with three coffee beans.', 'Complex'),
(105, 'Dry-shake egg white, lemon juice, simple syrup, and bourbon. Add ice, shake again until very cold. Strain into a rocks glass, dash Angostura on the foam, and draw a design with a toothpick.', 'Complex'),
(106, 'Combine gin, maraschino liqueur, fresh lime juice, and crème de violette in a shaker with ice. Shake and strain into a chilled cocktail glass. Garnish with a brandied cherry.', 'Complex'),
(107, 'Build dark rum and ginger beer over ice in a tall glass. Squeeze in fresh lime juice, stir briefly, and garnish with a lime wheel and candied ginger.', 'Simple');

-- ============================================================
-- 2. tool (no FK dependencies)
-- ============================================================
INSERT INTO tool (tool_id, tool_name, tool_description, tool_image_url) VALUES
(10, 'Cocktail Shaker',    'A three-piece Boston or cobbler shaker for mixing and chilling drinks.',  NULL),
(20, 'Mixing Glass',       'A heavy-bottomed glass used for stirring spirit-forward cocktails.',       NULL),
(30, 'Muddler',            'A wooden or metal rod used to crush herbs, fruit, and sugar.',             NULL),
(40, 'Jigger',             'A double-ended measuring tool for precise pours (1 oz / 2 oz).',          NULL),
(50, 'Hawthorne Strainer', 'A spring-loaded strainer that fits over a shaker or mixing glass.',        NULL),
(60, 'Bar Spoon',          'A long-handled spoon for stirring and layering drinks.',                   NULL),
(70, 'Fine Mesh Strainer', 'A small strainer used for double-straining to remove ice shards.',         NULL);

-- ============================================================
-- 3. ingredient_type (no FK dependencies)
-- ============================================================
INSERT INTO ingredient_type (ingred_type_id, ingred_type_name, ingred_type_description) VALUES
(1, 'Spirit',    'Base distilled alcoholic beverages such as rum, vodka, and gin.'),
(2, 'Liqueur',   'Sweetened spirits infused with flavors like coffee, herbs, or fruit.'),
(3, 'Citrus',    'Fresh citrus fruits and their juices.'),
(4, 'Sweetener', 'Sugars, syrups, and honey used to balance acidity and bitterness.'),
(5, 'Herb',      'Fresh or dried botanical garnishes and muddling ingredients.'),
(6, 'Mixer',     'Non-alcoholic carbonated or flavored liquids for topping drinks.'),
(7, 'Bitter',    'Concentrated aromatic extracts used in dashes for complexity.');

-- ============================================================
-- 4. ingredient (FK -> ingredient_type)
-- ============================================================
INSERT INTO ingredient (ingredient_id, ingredient_name, ingredient_description, ingred_type_id) VALUES
(501, 'White Rum',          'Light-bodied Caribbean rum.',                          1),
(502, 'Tequila Blanco',     'Unaged agave spirit from Mexico.',                     1),
(503, 'Bourbon',            'American oak-aged corn-based whiskey.',                 1),
(504, 'Vodka',              'Neutral grain spirit, distilled for purity.',           1),
(505, 'Gin',                'Juniper-forward botanical spirit.',                     1),
(506, 'Dark Rum',           'Full-bodied aged Caribbean rum.',                       1),
(507, 'Triple Sec',         'Orange-flavored clear liqueur.',                        2),
(508, 'Coffee Liqueur',     'Rich espresso-infused sweet liqueur.',                  2),
(509, 'Maraschino Liqueur', 'Cherry-pit distillate with a dry, nutty flavor.',       2),
(510, 'Crème de Violette',  'Floral violet-flavored liqueur.',                       2),
(511, 'Lime Juice',         'Freshly squeezed lime juice.',                          3),
(512, 'Lemon Juice',        'Freshly squeezed lemon juice.',                         3),
(513, 'Simple Syrup',       'Equal-parts sugar and water syrup.',                    4),
(514, 'Sugar',              'Granulated white cane sugar.',                          4),
(515, 'Mint Leaves',        'Fresh spearmint leaves for muddling and garnish.',      5),
(516, 'Soda Water',         'Plain carbonated water.',                               6),
(517, 'Ginger Beer',        'Spicy non-alcoholic carbonated ginger drink.',          6),
(518, 'Fresh Espresso',     'A freshly pulled shot of espresso coffee.',             6),
(519, 'Angostura Bitters',  'Classic aromatic bitters from Trinidad.',               7),
(520, 'Egg White',          'Pasteurised egg white for cocktail foam.',              6);

-- ============================================================
-- 5. glass_type (no FK dependencies)
-- ============================================================
INSERT INTO glass_type (glass_type_id, glass_type_name, glass_type_description, glass_type_image_url) VALUES
(11, 'Highball',        'A tall, narrow glass for long mixed drinks.',                            NULL),
(12, 'Rocks',           'A short, wide tumbler for spirit-forward drinks.',                       NULL),
(13, 'Coupe',           'A stemmed bowl-shaped glass for elegant cocktails.',                     NULL),
(14, 'Margarita Glass', 'A wide-rimmed glass designed for frozen and shaken margaritas.',         NULL),
(15, 'Cocktail Glass',  'A classic V-shaped stemmed glass (martini style).',                      NULL),
(16, 'Collins',         'An extra-tall glass for fizzy, refreshing drinks.',                      NULL),
(17, 'Copper Mug',      'An insulated metal mug traditionally used for mules.',                   NULL);

-- ============================================================
-- 6. cocktail (FK -> recipe, glass_type; recipe_id is UNIQUE)
-- ============================================================
INSERT INTO cocktail (cocktail_id, cocktail_name, cocktail_description, cocktail_image_url, recipe_id, glass_type_id) VALUES
(201, 'Mojito',           'A refreshing Cuban classic with rum, mint, and lime.',       NULL, 101, 11),
(202, 'Margarita',        'The quintessential tequila-lime-salt combination.',           NULL, 102, 14),
(203, 'Old Fashioned',    'A timeless bourbon cocktail with bitters and citrus peel.',   NULL, 103, 12),
(204, 'Espresso Martini', 'A caffeinated, velvety after-dinner shaker cocktail.',        NULL, 104, 13),
(205, 'Whiskey Sour',     'A frothy, balanced blend of bourbon, citrus, and egg white.', NULL, 105, 12),
(206, 'Aviation',         'A floral, pre-Prohibition gin cocktail with violet notes.',   NULL, 106, 15),
(207, 'Dark & Stormy',    'Dark rum meets spicy ginger beer with a lime squeeze.',       NULL, 107, 17);

-- ============================================================
-- 7. flavor (no FK dependencies)
-- ============================================================
INSERT INTO flavor (flavor_id, flavor_name, flavor_description) VALUES
(301, 'Sweet',      'Sugary, dessert-like character.'),
(302, 'Sour',       'Tart, citrus-driven acidity.'),
(303, 'Bitter',     'Dry, herbal, or roasted bitterness.'),
(304, 'Refreshing', 'Light, crisp, and thirst-quenching.'),
(305, 'Smoky',      'Charred, oak, or campfire undertones.'),
(306, 'Floral',     'Botanical, fragrant, and perfumed notes.'),
(307, 'Spicy',      'Warm heat from ginger, pepper, or chili.');

-- ============================================================
-- 8. recipe_tool (FK -> recipe, tool)
-- ============================================================
INSERT INTO recipe_tool (recipe_id, tool_id) VALUES
(101, 30),  -- Mojito           -> Muddler
(101, 40),  -- Mojito           -> Jigger
(102, 10),  -- Margarita        -> Shaker
(102, 40),  -- Margarita        -> Jigger
(102, 50),  -- Margarita        -> Hawthorne Strainer
(103, 20),  -- Old Fashioned    -> Mixing Glass
(103, 60),  -- Old Fashioned    -> Bar Spoon
(103, 40),  -- Old Fashioned    -> Jigger
(104, 10),  -- Espresso Martini -> Shaker
(104, 70),  -- Espresso Martini -> Fine Mesh Strainer
(104, 40),  -- Espresso Martini -> Jigger
(105, 10),  -- Whiskey Sour     -> Shaker
(105, 50),  -- Whiskey Sour     -> Hawthorne Strainer
(106, 10),  -- Aviation         -> Shaker
(106, 50),  -- Aviation         -> Hawthorne Strainer
(107, 40);  -- Dark & Stormy    -> Jigger

-- ============================================================
-- 9. recipe_ingredient (FK -> recipe, ingredient)
-- ============================================================
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES
-- Mojito
(101, 501, 2.0,  'oz'),
(101, 511, 1.0,  'oz'),
(101, 514, 2.0,  'tsp'),
(101, 515, 8.0,  'leaves'),
(101, 516, 2.0,  'oz'),
-- Margarita
(102, 502, 2.0,  'oz'),
(102, 507, 1.0,  'oz'),
(102, 511, 1.0,  'oz'),
-- Old Fashioned
(103, 503, 2.0,  'oz'),
(103, 513, 0.25, 'oz'),
(103, 519, 3.0,  'dashes'),
-- Espresso Martini
(104, 504, 1.5,  'oz'),
(104, 508, 1.0,  'oz'),
(104, 518, 1.0,  'shot'),
-- Whiskey Sour
(105, 503, 2.0,  'oz'),
(105, 512, 0.75, 'oz'),
(105, 513, 0.75, 'oz'),
(105, 519, 2.0,  'dashes'),
(105, 520, 1.0,  'oz'),
-- Aviation
(106, 505, 2.0,  'oz'),
(106, 509, 0.5,  'oz'),
(106, 511, 0.75, 'oz'),
(106, 510, 0.25, 'oz'),
-- Dark & Stormy
(107, 506, 2.0,  'oz'),
(107, 517, 4.0,  'oz'),
(107, 511, 0.5,  'oz');

-- ============================================================
-- 10. cocktail_flavor (FK -> cocktail, flavor)
-- ============================================================
INSERT INTO cocktail_flavor (cocktail_id, flavor_id) VALUES
(201, 302), (201, 304),   -- Mojito:           Sour, Refreshing
(202, 302), (202, 301),   -- Margarita:        Sour, Sweet
(203, 303), (203, 305),   -- Old Fashioned:    Bitter, Smoky
(204, 303), (204, 301),   -- Espresso Martini: Bitter, Sweet
(205, 302), (205, 301),   -- Whiskey Sour:     Sour, Sweet
(206, 306), (206, 302),   -- Aviation:         Floral, Sour
(207, 307), (207, 304);   -- Dark & Stormy:    Spicy, Refreshing

-- ============================================================
-- 11. app_user (no FK dependencies)
-- ============================================================
INSERT INTO app_user (user_id, username, email, password_hash, created_at) VALUES
(1001, 'mixmaster_mike', 'mike@cocktail.com',  'admin',    '2025-01-15 10:30:00'),
(1002, 'cocktail_carla', 'carla@gmail.com',    'Carla@456',   '2025-02-01 14:00:00'),
(1003, 'shaker_sam',     'sam@yahoo.com',      'Sam@789',     '2025-02-20 09:15:00'),
(1004, 'lime_lucy',      'lucy@outlook.com',   'Lucy@321',    '2025-03-05 18:45:00'),
(1005, 'bourbon_ben',    'ben@gmail.com',      'Ben@654',     '2025-03-22 20:00:00'),
(1006, 'tiki_tara',      'tara@cocktail.com',  'Tara@987',    '2025-04-10 12:30:00'),
(1007, 'neat_nina',      'nina@outlook.com',   'Nina@123',    '2025-05-01 16:00:00');

-- ============================================================
-- 12. review (FK -> cocktail, app_user; UNIQUE(user_id, cocktail_id))
-- ============================================================
INSERT INTO review (review_id, cocktail_id, user_id, rating, review_text, created_at) VALUES
(5001, 201, 1001, 4.5, 'Perfect summer sipper — fresh and minty!',                    '2025-04-01 11:00:00'),
(5002, 202, 1002, 5.0, 'Best margarita recipe I have ever tried. Balanced and tangy.', '2025-04-02 15:30:00'),
(5003, 203, 1005, 2.0, 'Too bitter for my liking. Not enough sweetness to balance.',   '2025-04-03 19:00:00'),
(5004, 204, 1003, 3.5, 'Great after-dinner pick-me-up. Love the frothy top.',         '2025-04-04 20:15:00'),
(5005, 205, 1004, 1.0, 'Not my thing at all. The egg white was off-putting.',          '2025-04-05 13:45:00'),
(5006, 206, 1007, 5.0, 'Absolutely gorgeous — the violet hue is stunning.',           '2025-04-06 17:00:00'),
(5007, 207, 1006, 3.0, 'Decent but a bit one-dimensional. Needs more complexity.',     '2025-04-07 21:30:00'),
(5008, 201, 1003, 4.0, 'Refreshing and well-made. Would order again.',                '2025-04-08 10:00:00'),
(5009, 203, 1002, 1.5, 'Way too strong for me. Could not finish it.',                  '2025-04-09 14:00:00'),
(5010, 204, 1006, 4.5, 'Incredible. I make this every Friday night now.',             '2025-04-10 18:00:00');

-- ============================================================
-- 13. user_favorite (FK -> app_user, cocktail; UNIQUE(user_id, cocktail_id))
-- ============================================================
INSERT INTO user_favorite (favorite_id, user_id, cocktail_id) VALUES
(801, 1001, 201),  -- mike  -> Mojito
(802, 1002, 202),  -- carla -> Margarita
(803, 1005, 203),  -- ben   -> Old Fashioned
(804, 1003, 204),  -- sam   -> Espresso Martini
(805, 1004, 201),  -- lucy  -> Mojito
(806, 1007, 206),  -- nina  -> Aviation
(807, 1006, 207);  -- tara  -> Dark & Stormy

-- ============================================================
-- SELECT * queries to view all populated tables
-- ============================================================
SELECT * FROM recipe;
SELECT * FROM tool;
SELECT * FROM ingredient_type;
SELECT * FROM ingredient;
SELECT * FROM glass_type;
SELECT * FROM cocktail;
SELECT * FROM flavor;
SELECT * FROM recipe_tool;
SELECT * FROM recipe_ingredient;
SELECT * FROM cocktail_flavor;
SELECT * FROM app_user;
SELECT * FROM review;
SELECT * FROM user_favorite;