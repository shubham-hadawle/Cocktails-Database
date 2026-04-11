import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, Star, Heart, ChevronDown, ChevronUp, X, Plus, Minus, LogIn, LogOut, User, Filter, BarChart3, Wine, ArrowLeft, Trash2, Edit3, Check, AlertCircle, Coffee, Sparkles, Clock, ChefHat, GlassWater, Martini, Flame, Leaf, Zap, Eye, EyeOff, Users, MessageSquare, TrendingUp, PieChart, Award } from "lucide-react";
import * as d3 from "d3";
import _ from "lodash";

// ============================================================
// NEON NIGHTLIFE THEME — inspired by reference image
// Colors: Deep navy/black base, neon amber, electric cyan, hot magenta, violet
// ============================================================
const NEON = {
  bg: "#0A0A14",
  bgCard: "rgba(15,15,28,0.85)",
  bgPanel: "rgba(18,14,30,0.9)",
  bgOverlay: "rgba(8,6,18,0.92)",
  amber: "#FF8C00",
  amberGlow: "#FF6B00",
  amberSoft: "#FFB347",
  cyan: "#00E5FF",
  cyanGlow: "#00BCD4",
  cyanSoft: "#4DD0E1",
  magenta: "#FF2D95",
  magentaGlow: "#E91E90",
  magentaSoft: "#FF6EB4",
  violet: "#B24BF3",
  violetGlow: "#9C27B0",
  violetSoft: "#CE93D8",
  textPrimary: "#F0E6FF",
  textSecondary: "#9B8FB8",
  textMuted: "#5D5478",
  borderNeon: "rgba(178,75,243,0.2)",
  borderAmber: "rgba(255,140,0,0.2)",
  borderCyan: "rgba(0,229,255,0.15)",
  borderMagenta: "rgba(255,45,149,0.2)",
  star: "#FFAB00",
};

// ============================================================
// DATABASE LAYER — mirrors the MySQL schema exactly
// ============================================================
const DB = {
  recipe: [
    { recipe_id: 101, instructions: "Muddle mint leaves and sugar in a glass. Add lime juice, fill with crushed ice, pour in white rum, and top with soda water. Stir gently and garnish with a sprig of mint.", difficulty: "Simple" },
    { recipe_id: 102, instructions: "Combine tequila, lime juice, and triple sec in a shaker with ice. Shake vigorously, then strain into a salt-rimmed glass over fresh ice.", difficulty: "Simple" },
    { recipe_id: 103, instructions: "Stir bourbon, sugar syrup, and Angostura bitters with ice in a mixing glass until well chilled. Strain into a rocks glass over a large ice cube and garnish with an orange peel.", difficulty: "Simple" },
    { recipe_id: 104, instructions: "Shake vodka, coffee liqueur, and fresh espresso with ice until frothy. Double-strain into a chilled coupe glass and garnish with three coffee beans.", difficulty: "Complex" },
    { recipe_id: 105, instructions: "Dry-shake egg white, lemon juice, simple syrup, and bourbon. Add ice, shake again until very cold. Strain into a rocks glass, dash Angostura on the foam, and draw a design with a toothpick.", difficulty: "Complex" },
    { recipe_id: 106, instructions: "Combine gin, maraschino liqueur, fresh lime juice, and crème de violette in a shaker with ice. Shake and strain into a chilled cocktail glass. Garnish with a brandied cherry.", difficulty: "Complex" },
    { recipe_id: 107, instructions: "Build dark rum and ginger beer over ice in a tall glass. Squeeze in fresh lime juice, stir briefly, and garnish with a lime wheel and candied ginger.", difficulty: "Simple" },
  ],
  tool: [
    { tool_id: 10, tool_name: "Cocktail Shaker", tool_description: "A three-piece Boston or cobbler shaker for mixing and chilling drinks." },
    { tool_id: 20, tool_name: "Mixing Glass", tool_description: "A heavy-bottomed glass used for stirring spirit-forward cocktails." },
    { tool_id: 30, tool_name: "Muddler", tool_description: "A wooden or metal rod used to crush herbs, fruit, and sugar." },
    { tool_id: 40, tool_name: "Jigger", tool_description: "A double-ended measuring tool for precise pours (1 oz / 2 oz)." },
    { tool_id: 50, tool_name: "Hawthorne Strainer", tool_description: "A spring-loaded strainer that fits over a shaker or mixing glass." },
    { tool_id: 60, tool_name: "Bar Spoon", tool_description: "A long-handled spoon for stirring and layering drinks." },
    { tool_id: 70, tool_name: "Fine Mesh Strainer", tool_description: "A small strainer used for double-straining to remove ice shards." },
  ],
  ingredient_type: [
    { ingred_type_id: 1, ingred_type_name: "Spirit" },
    { ingred_type_id: 2, ingred_type_name: "Liqueur" },
    { ingred_type_id: 3, ingred_type_name: "Citrus" },
    { ingred_type_id: 4, ingred_type_name: "Sweetener" },
    { ingred_type_id: 5, ingred_type_name: "Herb" },
    { ingred_type_id: 6, ingred_type_name: "Mixer" },
    { ingred_type_id: 7, ingred_type_name: "Bitter" },
  ],
  ingredient: [
    { ingredient_id: 501, ingredient_name: "White Rum", ingred_type_id: 1 },
    { ingredient_id: 502, ingredient_name: "Tequila Blanco", ingred_type_id: 1 },
    { ingredient_id: 503, ingredient_name: "Bourbon", ingred_type_id: 1 },
    { ingredient_id: 504, ingredient_name: "Vodka", ingred_type_id: 1 },
    { ingredient_id: 505, ingredient_name: "Gin", ingred_type_id: 1 },
    { ingredient_id: 506, ingredient_name: "Dark Rum", ingred_type_id: 1 },
    { ingredient_id: 507, ingredient_name: "Triple Sec", ingred_type_id: 2 },
    { ingredient_id: 508, ingredient_name: "Coffee Liqueur", ingred_type_id: 2 },
    { ingredient_id: 509, ingredient_name: "Maraschino Liqueur", ingred_type_id: 2 },
    { ingredient_id: 510, ingredient_name: "Crème de Violette", ingred_type_id: 2 },
    { ingredient_id: 511, ingredient_name: "Lime Juice", ingred_type_id: 3 },
    { ingredient_id: 512, ingredient_name: "Lemon Juice", ingred_type_id: 3 },
    { ingredient_id: 513, ingredient_name: "Simple Syrup", ingred_type_id: 4 },
    { ingredient_id: 514, ingredient_name: "Sugar", ingred_type_id: 4 },
    { ingredient_id: 515, ingredient_name: "Mint Leaves", ingred_type_id: 5 },
    { ingredient_id: 516, ingredient_name: "Soda Water", ingred_type_id: 6 },
    { ingredient_id: 517, ingredient_name: "Ginger Beer", ingred_type_id: 6 },
    { ingredient_id: 518, ingredient_name: "Fresh Espresso", ingred_type_id: 6 },
    { ingredient_id: 519, ingredient_name: "Angostura Bitters", ingred_type_id: 7 },
    { ingredient_id: 520, ingredient_name: "Egg White", ingred_type_id: 6 },
  ],
  glass_type: [
    { glass_type_id: 11, glass_type_name: "Highball", glass_type_description: "A tall, narrow glass for long mixed drinks." },
    { glass_type_id: 12, glass_type_name: "Rocks", glass_type_description: "A short, wide tumbler for spirit-forward drinks." },
    { glass_type_id: 13, glass_type_name: "Coupe", glass_type_description: "A stemmed bowl-shaped glass for elegant cocktails." },
    { glass_type_id: 14, glass_type_name: "Margarita Glass", glass_type_description: "A wide-rimmed glass for margaritas." },
    { glass_type_id: 15, glass_type_name: "Cocktail Glass", glass_type_description: "A classic V-shaped stemmed glass (martini style)." },
    { glass_type_id: 16, glass_type_name: "Collins", glass_type_description: "An extra-tall glass for fizzy, refreshing drinks." },
    { glass_type_id: 17, glass_type_name: "Copper Mug", glass_type_description: "An insulated metal mug traditionally used for mules." },
  ],
  cocktail: [
    { cocktail_id: 201, cocktail_name: "Mojito", cocktail_description: "A refreshing Cuban classic with rum, mint, and lime.", recipe_id: 101, glass_type_id: 11 },
    { cocktail_id: 202, cocktail_name: "Margarita", cocktail_description: "The quintessential tequila-lime-salt combination.", recipe_id: 102, glass_type_id: 14 },
    { cocktail_id: 203, cocktail_name: "Old Fashioned", cocktail_description: "A timeless bourbon cocktail with bitters and citrus peel.", recipe_id: 103, glass_type_id: 12 },
    { cocktail_id: 204, cocktail_name: "Espresso Martini", cocktail_description: "A caffeinated, velvety after-dinner shaker cocktail.", recipe_id: 104, glass_type_id: 13 },
    { cocktail_id: 205, cocktail_name: "Whiskey Sour", cocktail_description: "A frothy, balanced blend of bourbon, citrus, and egg white.", recipe_id: 105, glass_type_id: 12 },
    { cocktail_id: 206, cocktail_name: "Aviation", cocktail_description: "A floral, pre-Prohibition gin cocktail with violet notes.", recipe_id: 106, glass_type_id: 15 },
    { cocktail_id: 207, cocktail_name: "Dark & Stormy", cocktail_description: "Dark rum meets spicy ginger beer with a lime squeeze.", recipe_id: 107, glass_type_id: 17 },
  ],
  flavor: [
    { flavor_id: 301, flavor_name: "Sweet" },
    { flavor_id: 302, flavor_name: "Sour" },
    { flavor_id: 303, flavor_name: "Bitter" },
    { flavor_id: 304, flavor_name: "Refreshing" },
    { flavor_id: 305, flavor_name: "Smoky" },
    { flavor_id: 306, flavor_name: "Floral" },
    { flavor_id: 307, flavor_name: "Spicy" },
  ],
  cocktail_flavor: [
    { cocktail_id: 201, flavor_id: 302 }, { cocktail_id: 201, flavor_id: 304 },
    { cocktail_id: 202, flavor_id: 302 }, { cocktail_id: 202, flavor_id: 301 },
    { cocktail_id: 203, flavor_id: 303 }, { cocktail_id: 203, flavor_id: 305 },
    { cocktail_id: 204, flavor_id: 303 }, { cocktail_id: 204, flavor_id: 301 },
    { cocktail_id: 205, flavor_id: 302 }, { cocktail_id: 205, flavor_id: 301 },
    { cocktail_id: 206, flavor_id: 306 }, { cocktail_id: 206, flavor_id: 302 },
    { cocktail_id: 207, flavor_id: 307 }, { cocktail_id: 207, flavor_id: 304 },
  ],
  recipe_tool: [
    { recipe_id: 101, tool_id: 30 }, { recipe_id: 101, tool_id: 40 },
    { recipe_id: 102, tool_id: 10 }, { recipe_id: 102, tool_id: 40 }, { recipe_id: 102, tool_id: 50 },
    { recipe_id: 103, tool_id: 20 }, { recipe_id: 103, tool_id: 60 }, { recipe_id: 103, tool_id: 40 },
    { recipe_id: 104, tool_id: 10 }, { recipe_id: 104, tool_id: 70 }, { recipe_id: 104, tool_id: 40 },
    { recipe_id: 105, tool_id: 10 }, { recipe_id: 105, tool_id: 50 },
    { recipe_id: 106, tool_id: 10 }, { recipe_id: 106, tool_id: 50 },
    { recipe_id: 107, tool_id: 40 },
  ],
  recipe_ingredient: [
    { recipe_id: 101, ingredient_id: 501, quantity: 2.0, unit: "oz" },
    { recipe_id: 101, ingredient_id: 511, quantity: 1.0, unit: "oz" },
    { recipe_id: 101, ingredient_id: 514, quantity: 2.0, unit: "tsp" },
    { recipe_id: 101, ingredient_id: 515, quantity: 8.0, unit: "leaves" },
    { recipe_id: 101, ingredient_id: 516, quantity: 2.0, unit: "oz" },
    { recipe_id: 102, ingredient_id: 502, quantity: 2.0, unit: "oz" },
    { recipe_id: 102, ingredient_id: 507, quantity: 1.0, unit: "oz" },
    { recipe_id: 102, ingredient_id: 511, quantity: 1.0, unit: "oz" },
    { recipe_id: 103, ingredient_id: 503, quantity: 2.0, unit: "oz" },
    { recipe_id: 103, ingredient_id: 513, quantity: 0.25, unit: "oz" },
    { recipe_id: 103, ingredient_id: 519, quantity: 3.0, unit: "dashes" },
    { recipe_id: 104, ingredient_id: 504, quantity: 1.5, unit: "oz" },
    { recipe_id: 104, ingredient_id: 508, quantity: 1.0, unit: "oz" },
    { recipe_id: 104, ingredient_id: 518, quantity: 1.0, unit: "shot" },
    { recipe_id: 105, ingredient_id: 503, quantity: 2.0, unit: "oz" },
    { recipe_id: 105, ingredient_id: 512, quantity: 0.75, unit: "oz" },
    { recipe_id: 105, ingredient_id: 513, quantity: 0.75, unit: "oz" },
    { recipe_id: 105, ingredient_id: 519, quantity: 2.0, unit: "dashes" },
    { recipe_id: 105, ingredient_id: 520, quantity: 1.0, unit: "oz" },
    { recipe_id: 106, ingredient_id: 505, quantity: 2.0, unit: "oz" },
    { recipe_id: 106, ingredient_id: 509, quantity: 0.5, unit: "oz" },
    { recipe_id: 106, ingredient_id: 511, quantity: 0.75, unit: "oz" },
    { recipe_id: 106, ingredient_id: 510, quantity: 0.25, unit: "oz" },
    { recipe_id: 107, ingredient_id: 506, quantity: 2.0, unit: "oz" },
    { recipe_id: 107, ingredient_id: 517, quantity: 4.0, unit: "oz" },
    { recipe_id: 107, ingredient_id: 511, quantity: 0.5, unit: "oz" },
  ],
  app_user: [
    { user_id: 1001, username: "mixmaster_mike", email: "mike@cocktail.com", password_hash: "admin", created_at: "2025-01-15" },
    { user_id: 1002, username: "cocktail_carla", email: "carla@gmail.com", password_hash: "Carla@456", created_at: "2025-02-01" },
    { user_id: 1003, username: "shaker_sam", email: "sam@yahoo.com", password_hash: "Sam@789", created_at: "2025-02-20" },
    { user_id: 1004, username: "lime_lucy", email: "lucy@outlook.com", password_hash: "Lucy@321", created_at: "2025-03-05" },
    { user_id: 1005, username: "bourbon_ben", email: "ben@gmail.com", password_hash: "Ben@654", created_at: "2025-03-22" },
    { user_id: 1006, username: "tiki_tara", email: "tara@cocktail.com", password_hash: "Tara@987", created_at: "2025-04-10" },
    { user_id: 1007, username: "neat_nina", email: "nina@outlook.com", password_hash: "Nina@123", created_at: "2025-05-01" },
  ],
  review: [
    { review_id: 5001, cocktail_id: 201, user_id: 1001, rating: 4.5, review_text: "Perfect summer sipper — fresh and minty!", created_at: "2025-04-01" },
    { review_id: 5002, cocktail_id: 202, user_id: 1002, rating: 5.0, review_text: "Best margarita recipe I have ever tried. Balanced and tangy.", created_at: "2025-04-02" },
    { review_id: 5003, cocktail_id: 203, user_id: 1005, rating: 2.0, review_text: "Too bitter for my liking. Not enough sweetness to balance.", created_at: "2025-04-03" },
    { review_id: 5004, cocktail_id: 204, user_id: 1003, rating: 3.5, review_text: "Great after-dinner pick-me-up. Love the frothy top.", created_at: "2025-04-04" },
    { review_id: 5005, cocktail_id: 205, user_id: 1004, rating: 1.0, review_text: "Not my thing at all. The egg white was off-putting.", created_at: "2025-04-05" },
    { review_id: 5006, cocktail_id: 206, user_id: 1007, rating: 5.0, review_text: "Absolutely gorgeous — the violet hue is stunning.", created_at: "2025-04-06" },
    { review_id: 5007, cocktail_id: 207, user_id: 1006, rating: 3.0, review_text: "Decent but a bit one-dimensional. Needs more complexity.", created_at: "2025-04-07" },
    { review_id: 5008, cocktail_id: 201, user_id: 1003, rating: 4.0, review_text: "Refreshing and well-made. Would order again.", created_at: "2025-04-08" },
    { review_id: 5009, cocktail_id: 203, user_id: 1002, rating: 1.5, review_text: "Way too strong for me. Could not finish it.", created_at: "2025-04-09" },
    { review_id: 5010, cocktail_id: 204, user_id: 1006, rating: 4.5, review_text: "Incredible. I make this every Friday night now.", created_at: "2025-04-10" },
  ],
  user_favorite: [
    { favorite_id: 801, user_id: 1001, cocktail_id: 201 },
    { favorite_id: 802, user_id: 1002, cocktail_id: 202 },
    { favorite_id: 803, user_id: 1005, cocktail_id: 203 },
    { favorite_id: 804, user_id: 1003, cocktail_id: 204 },
    { favorite_id: 805, user_id: 1004, cocktail_id: 201 },
    { favorite_id: 806, user_id: 1007, cocktail_id: 206 },
    { favorite_id: 807, user_id: 1006, cocktail_id: 207 },
  ],
};

const COCKTAIL_IMAGES = {
  201: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
  202: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=400&h=400&fit=crop",
  203: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop",
  204: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
  205: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&h=400&fit=crop",
  206: "https://images.unsplash.com/photo-1587223962217-f4c4c7c0e5e7?w=400&h=400&fit=crop",
  207: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=400&fit=crop",
};
const COCKTAIL_EMOJIS = { 201: "🌿", 202: "🍋", 203: "🥃", 204: "☕", 205: "🍊", 206: "💜", 207: "⚡" };
const FLAVOR_COLORS = { Sweet: NEON.amber, Sour: "#39FF14", Bitter: NEON.violet, Refreshing: NEON.cyan, Smoky: "#FF6347", Floral: NEON.magenta, Spicy: "#FF4500" };
const FLAVOR_ICONS = { Sweet: "🍯", Sour: "🍋", Bitter: "🫒", Refreshing: "❄️", Smoky: "🔥", Floral: "🌸", Spicy: "🌶️" };
const GLASS_ICONS = { Highball: "🥤", Rocks: "🥃", Coupe: "🍸", "Margarita Glass": "🍹", "Cocktail Glass": "🍸", Collins: "🥤", "Copper Mug": "🫗" };
const TOOL_ICONS = { "Cocktail Shaker": "🧊", "Mixing Glass": "🥃", Muddler: "🪵", Jigger: "📏", "Hawthorne Strainer": "🔧", "Bar Spoon": "🥄", "Fine Mesh Strainer": "🔬" };
const DIFFICULTY_COLORS = { Simple: "#39FF14", Complex: NEON.amber };
const CARD_GLOWS = [
  `linear-gradient(135deg, ${NEON.amber}44, ${NEON.magenta}44)`,
  `linear-gradient(135deg, ${NEON.cyan}44, ${NEON.violet}44)`,
  `linear-gradient(135deg, ${NEON.magenta}44, ${NEON.amber}44)`,
  `linear-gradient(135deg, ${NEON.violet}44, ${NEON.cyan}44)`,
  `linear-gradient(135deg, ${NEON.amber}44, ${NEON.cyan}44)`,
  `linear-gradient(135deg, ${NEON.cyan}44, ${NEON.magenta}44)`,
  `linear-gradient(135deg, ${NEON.magenta}44, ${NEON.violet}44)`,
];

function enrichCocktail(c) {
  const recipe = DB.recipe.find(r => r.recipe_id === c.recipe_id);
  const glass = DB.glass_type.find(g => g.glass_type_id === c.glass_type_id);
  const flavorIds = DB.cocktail_flavor.filter(cf => cf.cocktail_id === c.cocktail_id).map(cf => cf.flavor_id);
  const flavors = DB.flavor.filter(f => flavorIds.includes(f.flavor_id));
  const toolIds = DB.recipe_tool.filter(rt => rt.recipe_id === c.recipe_id).map(rt => rt.tool_id);
  const tools = DB.tool.filter(t => toolIds.includes(t.tool_id));
  const ingredientRows = DB.recipe_ingredient.filter(ri => ri.recipe_id === c.recipe_id);
  const ingredients = ingredientRows.map(ri => {
    const ing = DB.ingredient.find(i => i.ingredient_id === ri.ingredient_id);
    const ingType = DB.ingredient_type.find(it => it.ingred_type_id === ing.ingred_type_id);
    return { ...ri, name: ing.ingredient_name, type: ingType.ingred_type_name };
  });
  const reviews = DB.review.filter(r => r.cocktail_id === c.cocktail_id);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
  return { ...c, recipe, glass, flavors, tools, ingredients, reviews, avgRating, image: COCKTAIL_IMAGES[c.cocktail_id], emoji: COCKTAIL_EMOJIS[c.cocktail_id] };
}

function NeonBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${NEON.amber}08 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${NEON.cyan}06 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, ${NEON.magenta}06 0%, transparent 50%), ${NEON.bg}` }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: "-10%", left: "-10%", background: `radial-gradient(circle, ${NEON.amber}0A 0%, transparent 70%)`, animation: "orbFloat1 20s ease-in-out infinite", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: "30%", right: "-5%", background: `radial-gradient(circle, ${NEON.magenta}08 0%, transparent 70%)`, animation: "orbFloat2 25s ease-in-out infinite", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", bottom: "-15%", left: "30%", background: `radial-gradient(circle, ${NEON.cyan}06 0%, transparent 70%)`, animation: "orbFloat3 22s ease-in-out infinite", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", top: "60%", left: "10%", background: `radial-gradient(circle, ${NEON.violet}08 0%, transparent 70%)`, animation: "orbFloat1 18s ease-in-out infinite reverse", filter: "blur(50px)" }} />
      {[8, 25, 72, 92].map((left, i) => (
        <div key={i} style={{ position: "absolute", left: `${left}%`, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, transparent, ${[NEON.amber, NEON.cyan, NEON.magenta, NEON.violet][i]}15, transparent)`, animation: `neonPulse ${3 + i * 0.5}s ease-in-out infinite alternate` }} />
      ))}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: `linear-gradient(to top, ${NEON.violet}06, ${NEON.magenta}04, transparent)` }} />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: NEON.cyan, error: NEON.magenta, warning: NEON.amber };
  const bg = colors[type] || NEON.cyan;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: NEON.bgCard, color: bg, padding: "14px 22px", borderRadius: 14, boxShadow: `0 0 30px ${bg}30, 0 8px 32px rgba(0,0,0,0.5)`, border: `1px solid ${bg}50`, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, animation: "slideUp 0.3s ease-out", backdropFilter: "blur(16px)" }}>
      {type === "success" ? <Check size={16} /> : type === "error" ? <AlertCircle size={16} /> : <Sparkles size={16} />}
      {message}
    </div>
  );
}

function StarRating({ rating, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const val = interactive ? (hover || rating) : rating;
        const filled = i <= Math.floor(val);
        const half = !filled && i - 0.5 <= val;
        return (
          <span key={i} style={{ cursor: interactive ? "pointer" : "default", fontSize: size, lineHeight: 1, color: filled || half ? NEON.star : NEON.textMuted, transition: "all 0.15s", filter: filled || half ? `drop-shadow(0 0 4px ${NEON.star}60)` : "none" }}
            onMouseEnter={() => interactive && setHover(i)} onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange && onChange(i)}>
            {filled ? "★" : half ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

function AnalyticsDashboard({ cocktails }) {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const ratingData = cocktails.filter(c => c.avgRating !== null).map(c => ({ name: c.cocktail_name, rating: Math.round(c.avgRating * 10) / 10 })).sort((a, b) => b.rating - a.rating);
  const flavorFreq = {}; cocktails.forEach(c => c.flavors.forEach(f => { flavorFreq[f.flavor_name] = (flavorFreq[f.flavor_name] || 0) + 1; }));
  const flavorData = Object.entries(flavorFreq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const typeFreq = {}; cocktails.forEach(c => c.ingredients.forEach(i => { typeFreq[i.type] = (typeFreq[i.type] || 0) + 1; }));
  const typeData = Object.entries(typeFreq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const diffSplit = _.countBy(cocktails, c => c.recipe.difficulty);
  const toolFreq = {}; cocktails.forEach(c => c.tools.forEach(t => { toolFreq[t.tool_name] = (toolFreq[t.tool_name] || 0) + 1; }));
  const toolData = Object.entries(toolFreq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const avgIngredients = (cocktails.reduce((s, c) => s + c.ingredients.length, 0) / cocktails.length).toFixed(1);
  const neonColors = [NEON.cyan, NEON.magenta, NEON.amber, NEON.violet, NEON.cyanSoft, NEON.magentaSoft, NEON.amberSoft];

  useEffect(() => {
    if (!chartRef1.current || !ratingData.length) return;
    const el = chartRef1.current; el.innerHTML = "";
    const w = el.clientWidth, h = 200, m = { t: 10, r: 10, b: 50, l: 40 };
    const svg = d3.select(el).append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleBand().domain(ratingData.map(d => d.name)).range([m.l, w - m.r]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 5]).range([h - m.b, m.t]);
    const defs = svg.append("defs");
    neonColors.forEach((c, i) => { const f = defs.append("filter").attr("id", `glow${i}`); f.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur"); const mg = f.append("feMerge"); mg.append("feMergeNode").attr("in", "coloredBlur"); mg.append("feMergeNode").attr("in", "SourceGraphic"); });
    svg.selectAll("rect").data(ratingData).join("rect").attr("x", d => x(d.name)).attr("y", d => y(d.rating)).attr("width", x.bandwidth()).attr("height", d => h - m.b - y(d.rating)).attr("rx", 4).attr("fill", (d, i) => neonColors[i % neonColors.length]).attr("filter", (d, i) => `url(#glow${i % neonColors.length})`).attr("opacity", 0.85);
    svg.selectAll(".label").data(ratingData).join("text").attr("class", "label").attr("x", d => x(d.name) + x.bandwidth() / 2).attr("y", d => y(d.rating) - 6).attr("text-anchor", "middle").attr("fill", NEON.textPrimary).attr("font-size", 11).attr("font-weight", 600).text(d => d.rating);
    svg.append("g").attr("transform", `translate(0,${h - m.b})`).call(d3.axisBottom(x).tickSize(0)).selectAll("text").attr("fill", NEON.textSecondary).attr("font-size", 9).attr("transform", "rotate(-25)").attr("text-anchor", "end");
    svg.selectAll(".domain, .tick line").attr("stroke", NEON.textMuted + "40");
  }, [ratingData]);

  useEffect(() => {
    if (!chartRef2.current || !flavorData.length) return;
    const el = chartRef2.current; el.innerHTML = "";
    const size = 180, radius = size / 2;
    const svg = d3.select(el).append("svg").attr("width", size).attr("height", size).append("g").attr("transform", `translate(${radius},${radius})`);
    const defs = svg.append("defs"); const filter = defs.append("filter").attr("id", "donutGlow"); filter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur"); const merge = filter.append("feMerge"); merge.append("feMergeNode").attr("in", "blur"); merge.append("feMergeNode").attr("in", "SourceGraphic");
    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 0.9);
    svg.selectAll("path").data(pie(flavorData)).join("path").attr("d", arc).attr("fill", d => FLAVOR_COLORS[d.data.name] || "#888").attr("stroke", NEON.bg).attr("stroke-width", 2).attr("filter", "url(#donutGlow)").attr("opacity", 0.9);
    svg.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em").attr("fill", NEON.textPrimary).attr("font-size", 22).attr("font-weight", 700).text(flavorData.length);
    svg.append("text").attr("text-anchor", "middle").attr("dy", "1.2em").attr("fill", NEON.textSecondary).attr("font-size", 10).text("flavors");
  }, [flavorData]);

  const pnl = { background: `linear-gradient(145deg, rgba(15,15,28,0.7), rgba(10,10,20,0.9))`, border: `1px solid ${NEON.borderNeon}`, borderRadius: 14, padding: 16, backdropFilter: "blur(8px)" };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[{ label: "Cocktails", value: cocktails.length, icon: "🍸", glow: NEON.cyan }, { label: "Avg Rating", value: (cocktails.filter(c => c.avgRating).reduce((s, c) => s + c.avgRating, 0) / cocktails.filter(c => c.avgRating).length).toFixed(1), icon: "⭐", glow: NEON.amber }, { label: "Reviews", value: DB.review.length, icon: "💬", glow: NEON.magenta }, { label: "Avg Ingredients", value: avgIngredients, icon: "🧪", glow: NEON.violet }].map((s, i) => (
          <div key={i} style={{ background: `linear-gradient(145deg, rgba(178,75,243,0.08), rgba(0,229,255,0.04))`, border: `1px solid ${NEON.borderNeon}`, borderRadius: 14, padding: "16px 14px", textAlign: "center", backdropFilter: "blur(8px)", boxShadow: `0 0 20px ${s.glow}10` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.glow, fontFamily: "'Playfair Display', serif", textShadow: `0 0 20px ${s.glow}40` }}>{s.value}</div>
            <div style={{ fontSize: 11, color: NEON.textSecondary, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={pnl}><div style={{ fontSize: 13, fontWeight: 600, color: NEON.cyan, marginBottom: 10, textShadow: `0 0 10px ${NEON.cyan}30` }}>Average Ratings</div><div ref={chartRef1} style={{ width: "100%" }} /></div>
        <div style={{ ...pnl, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: NEON.magenta, marginBottom: 10, alignSelf: "flex-start", textShadow: `0 0 10px ${NEON.magenta}30` }}>Flavor Distribution</div>
          <div ref={chartRef2} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, justifyContent: "center" }}>
            {flavorData.map(f => (<span key={f.name} style={{ fontSize: 10, color: NEON.textSecondary, display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: FLAVOR_COLORS[f.name], display: "inline-block", boxShadow: `0 0 6px ${FLAVOR_COLORS[f.name]}60` }} />{f.name}</span>))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={pnl}>
          <div style={{ fontSize: 13, fontWeight: 600, color: NEON.amber, marginBottom: 10, textShadow: `0 0 10px ${NEON.amber}30` }}>Difficulty Breakdown</div>
          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(diffSplit).map(([key, val]) => (<div key={key} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: DIFFICULTY_COLORS[key], fontFamily: "'Playfair Display', serif", textShadow: `0 0 20px ${DIFFICULTY_COLORS[key]}40` }}>{val}</div><div style={{ fontSize: 11, color: NEON.textSecondary }}>{key}</div><div style={{ height: 6, borderRadius: 3, marginTop: 6, background: `${DIFFICULTY_COLORS[key]}15` }}><div style={{ height: "100%", borderRadius: 3, background: DIFFICULTY_COLORS[key], width: `${(val / cocktails.length) * 100}%`, boxShadow: `0 0 8px ${DIFFICULTY_COLORS[key]}60` }} /></div></div>))}
          </div>
        </div>
        <div style={pnl}>
          <div style={{ fontSize: 13, fontWeight: 600, color: NEON.violet, marginBottom: 10, textShadow: `0 0 10px ${NEON.violet}30` }}>Most-Used Tools</div>
          {toolData.slice(0, 5).map(t => (<div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{TOOL_ICONS[t.name] || "🔧"}</span><span style={{ flex: 1, fontSize: 12, color: NEON.textSecondary }}>{t.name}</span><div style={{ width: 60, height: 5, borderRadius: 3, background: `${NEON.violet}15` }}><div style={{ height: "100%", borderRadius: 3, background: NEON.violet, width: `${(t.count / toolData[0].count) * 100}%`, boxShadow: `0 0 6px ${NEON.violet}60` }} /></div><span style={{ fontSize: 11, color: NEON.textMuted, width: 16, textAlign: "right" }}>{t.count}</span></div>))}
        </div>
      </div>
      <div style={{ marginTop: 16, ...pnl }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: NEON.cyanSoft, marginBottom: 10 }}>Ingredient Types Across All Cocktails</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {typeData.map((t, i) => { const c = neonColors[i % 7]; return (<div key={t.name} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, background: `${c}10`, border: `1px solid ${c}30`, color: c }}>{t.name} <span style={{ fontWeight: 700 }}>{t.count}</span></div>); })}
        </div>
      </div>
    </div>
  );
}

function CocktailCard({ cocktail, onClick, isFavorited, onToggleFavorite, currentUser, index }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const glowGrad = CARD_GLOWS[index % CARD_GLOWS.length];
  const neonAccent = [NEON.cyan, NEON.magenta, NEON.amber, NEON.violet, NEON.cyanSoft, NEON.magentaSoft, NEON.amberSoft][index % 7];
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: NEON.bgCard, borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", border: `1px solid ${hovered ? neonAccent + "50" : NEON.borderNeon}`, boxShadow: hovered ? `0 0 30px ${neonAccent}20, 0 16px 48px rgba(0,0,0,0.4)` : `0 4px 20px rgba(0,0,0,0.3)`, transform: hovered ? "translateY(-6px) scale(1.02)" : "none", backdropFilter: "blur(12px)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: glowGrad, opacity: hovered ? 1 : 0.5, transition: "opacity 0.3s" }} />
      <div style={{ height: 190, position: "relative", overflow: "hidden" }}>
        {!imgError ? <img src={cocktail.image} alt={cocktail.cocktail_name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8, transition: "all 0.4s", transform: hovered ? "scale(1.08)" : "scale(1)" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, background: `linear-gradient(135deg, ${neonAccent}15, ${NEON.bg})` }}>{cocktail.emoji}</div>}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${NEON.bg} 0%, ${NEON.bg}80 30%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${neonAccent}40, transparent)` }} />
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", background: `${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}15`, color: DIFFICULTY_COLORS[cocktail.recipe.difficulty], border: `1px solid ${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}40`, backdropFilter: "blur(12px)", textShadow: `0 0 8px ${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}50` }}>{cocktail.recipe.difficulty.toUpperCase()}</span>
        </div>
        {currentUser && <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }} style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.5)", border: `1px solid ${isFavorited ? NEON.magenta + "60" : "rgba(255,255,255,0.1)"}`, borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(12px)", boxShadow: isFavorited ? `0 0 12px ${NEON.magenta}40` : "none" }}><Heart size={16} fill={isFavorited ? NEON.magenta : "none"} color={isFavorited ? NEON.magenta : "#fff"} /></button>}
      </div>
      <div style={{ padding: "14px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NEON.textPrimary, fontFamily: "'Playfair Display', serif" }}>{cocktail.cocktail_name}</h3>
          {cocktail.avgRating !== null && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: NEON.star, fontSize: 14, filter: `drop-shadow(0 0 4px ${NEON.star}60)` }}>★</span><span style={{ fontSize: 13, fontWeight: 600, color: NEON.textPrimary }}>{cocktail.avgRating.toFixed(1)}</span></div>}
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: NEON.textSecondary, lineHeight: 1.5 }}>{cocktail.cocktail_description}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {cocktail.flavors.map(f => (<span key={f.flavor_id} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 12, background: `${FLAVOR_COLORS[f.flavor_name]}12`, color: FLAVOR_COLORS[f.flavor_name], border: `1px solid ${FLAVOR_COLORS[f.flavor_name]}25`, textShadow: `0 0 6px ${FLAVOR_COLORS[f.flavor_name]}30` }}>{FLAVOR_ICONS[f.flavor_name]} {f.flavor_name}</span>))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: NEON.textMuted }}>{GLASS_ICONS[cocktail.glass.glass_type_name]} {cocktail.glass.glass_type_name}</span><span style={{ fontSize: 11, color: NEON.textMuted }}>{cocktail.ingredients.length} ingredients</span></div>
      </div>
    </div>
  );
}

function CocktailDetail({ cocktail, onBack, currentUser, onToggleFavorite, isFavorited, reviews, onSubmitReview, onDeleteReview, onEditReview, toast }) {
  const [newRating, setNewRating] = useState(0); const [newReviewText, setNewReviewText] = useState(""); const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null); const [editText, setEditText] = useState(""); const [editRating, setEditRating] = useState(0); const [imgError, setImgError] = useState(false);
  const userReview = currentUser ? reviews.find(r => r.user_id === currentUser.user_id) : null;
  const handleSubmit = () => { if (newRating === 0) { toast("Please select a rating", "error"); return; } onSubmitReview(cocktail.cocktail_id, newRating, newReviewText); setNewRating(0); setNewReviewText(""); setShowReviewForm(false); };
  const handleEditSave = (reviewId) => { if (editRating === 0) { toast("Please select a rating", "error"); return; } onEditReview(reviewId, editRating, editText); setEditingReviewId(null); };
  const inp = { width: "100%", padding: "10px 14px", background: `${NEON.bg}CC`, border: `1px solid ${NEON.borderNeon}`, borderRadius: 10, color: NEON.textPrimary, fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" };
  const pnl = { background: `linear-gradient(145deg, rgba(15,15,28,0.7), rgba(10,10,20,0.9))`, border: `1px solid ${NEON.borderNeon}`, borderRadius: 14, padding: 16, backdropFilter: "blur(8px)" };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: NEON.cyan, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, padding: "0 0 16px", fontFamily: "'Outfit', sans-serif", textShadow: `0 0 8px ${NEON.cyan}30` }}><ArrowLeft size={18} /> Back to cocktails</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div style={{ borderRadius: 22, overflow: "hidden", aspectRatio: "1", position: "relative", border: `1px solid ${NEON.borderNeon}`, boxShadow: `0 0 40px ${NEON.violet}15` }}>
            {!imgError ? <img src={cocktail.image} alt={cocktail.cocktail_name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, background: `linear-gradient(135deg, ${NEON.violet}15, ${NEON.bg})` }}>{cocktail.emoji}</div>}
            {currentUser && <button onClick={onToggleFavorite} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)", border: `1px solid ${isFavorited ? NEON.magenta + "60" : "rgba(255,255,255,0.1)"}`, borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(12px)", boxShadow: isFavorited ? `0 0 20px ${NEON.magenta}40` : "none" }}><Heart size={24} fill={isFavorited ? NEON.magenta : "none"} color={isFavorited ? NEON.magenta : "#fff"} /></button>}
          </div>
          <div style={{ ...pnl, marginTop: 16 }}><div style={{ fontSize: 13, fontWeight: 600, color: NEON.cyan, marginBottom: 8 }}>{GLASS_ICONS[cocktail.glass.glass_type_name]} Served in: {cocktail.glass.glass_type_name}</div><div style={{ fontSize: 12, color: NEON.textSecondary }}>{cocktail.glass.glass_type_description}</div></div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.textPrimary}, ${NEON.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{cocktail.cocktail_name}</h1>
            <span style={{ padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", background: `${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}15`, color: DIFFICULTY_COLORS[cocktail.recipe.difficulty], border: `1px solid ${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}40`, textShadow: `0 0 8px ${DIFFICULTY_COLORS[cocktail.recipe.difficulty]}40` }}>{cocktail.recipe.difficulty.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: 15, color: NEON.textSecondary, lineHeight: 1.6, margin: "8px 0 16px" }}>{cocktail.cocktail_description}</p>
          {cocktail.avgRating !== null && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><StarRating rating={cocktail.avgRating} size={18} /><span style={{ fontSize: 15, fontWeight: 600, color: NEON.star }}>{cocktail.avgRating.toFixed(1)}</span><span style={{ fontSize: 12, color: NEON.textMuted }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span></div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>{cocktail.flavors.map(f => (<span key={f.flavor_id} style={{ fontSize: 13, padding: "6px 16px", borderRadius: 20, background: `${FLAVOR_COLORS[f.flavor_name]}12`, color: FLAVOR_COLORS[f.flavor_name], border: `1px solid ${FLAVOR_COLORS[f.flavor_name]}30`, textShadow: `0 0 8px ${FLAVOR_COLORS[f.flavor_name]}40`, boxShadow: `0 0 12px ${FLAVOR_COLORS[f.flavor_name]}10` }}>{FLAVOR_ICONS[f.flavor_name]} {f.flavor_name}</span>))}</div>
          <div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NEON.cyan, margin: "0 0 10px", fontFamily: "'Playfair Display', serif", textShadow: `0 0 10px ${NEON.cyan}25` }}>Ingredients</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{cocktail.ingredients.map((ing, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: `rgba(178,75,243,0.04)`, borderRadius: 10, border: `1px solid ${NEON.borderNeon}` }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${NEON.violet}15`, color: NEON.violetSoft, border: `1px solid ${NEON.violet}20` }}>{ing.type}</span><span style={{ fontSize: 14, color: NEON.textPrimary }}>{ing.name}</span></div><span style={{ fontSize: 13, color: NEON.amber, fontWeight: 600, textShadow: `0 0 6px ${NEON.amber}30` }}>{ing.quantity} {ing.unit}</span></div>))}</div></div>
          {cocktail.tools.length > 0 && <div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NEON.magenta, margin: "0 0 10px", fontFamily: "'Playfair Display', serif", textShadow: `0 0 10px ${NEON.magenta}25` }}>Tools Needed</h3><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{cocktail.tools.map(t => (<span key={t.tool_id} style={{ padding: "7px 14px", borderRadius: 12, fontSize: 12, background: `${NEON.magenta}08`, border: `1px solid ${NEON.magenta}20`, color: NEON.magentaSoft, display: "flex", alignItems: "center", gap: 5 }}>{TOOL_ICONS[t.tool_name]} {t.tool_name}</span>))}</div></div>}
          <div><h3 style={{ fontSize: 16, fontWeight: 600, color: NEON.amber, margin: "0 0 10px", fontFamily: "'Playfair Display', serif", textShadow: `0 0 10px ${NEON.amber}25` }}>Preparation Instructions</h3><div style={{ padding: 18, borderRadius: 14, backdropFilter: "blur(8px)", background: `linear-gradient(145deg, ${NEON.amber}06, ${NEON.magenta}04)`, border: `1px solid ${NEON.borderAmber}`, borderLeft: `3px solid ${NEON.amber}`, boxShadow: `inset 0 0 30px ${NEON.amber}05` }}><p style={{ margin: 0, fontSize: 14, color: NEON.textSecondary, lineHeight: 1.9 }}>{cocktail.recipe.instructions}</p></div></div>
        </div>
      </div>
      <div style={{ marginTop: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.textPrimary}, ${NEON.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Reviews ({reviews.length})</h2>
          {currentUser && !userReview && <button onClick={() => setShowReviewForm(!showReviewForm)} style={{ background: showReviewForm ? `${NEON.magenta}15` : `${NEON.cyan}10`, border: `1px solid ${showReviewForm ? NEON.magenta + "30" : NEON.cyan + "30"}`, color: showReviewForm ? NEON.magenta : NEON.cyan, padding: "9px 18px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 0 15px ${showReviewForm ? NEON.magenta : NEON.cyan}15` }}>{showReviewForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Write a Review</>}</button>}
        </div>
        {showReviewForm && currentUser && !userReview && (
          <div style={{ ...pnl, marginBottom: 16, boxShadow: `0 0 30px ${NEON.cyan}10` }}>
            <div style={{ marginBottom: 12 }}><div style={{ fontSize: 13, color: NEON.textSecondary, marginBottom: 6 }}>Your Rating</div><StarRating rating={newRating} size={24} interactive onChange={setNewRating} /></div>
            <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} placeholder="Share your thoughts on this cocktail..." style={{ ...inp, minHeight: 80, resize: "vertical" }} />
            <button onClick={handleSubmit} style={{ marginTop: 10, padding: "11px 28px", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", color: NEON.bg, background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.violet})`, boxShadow: `0 0 20px ${NEON.cyan}30` }}>Submit Review</button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.length === 0 && <div style={{ textAlign: "center", padding: 40, color: NEON.textMuted, fontSize: 14 }}>No reviews yet. Be the first to share your thoughts!</div>}
          {reviews.map(review => {
            const reviewer = DB.app_user.find(u => u.user_id === review.user_id);
            const isOwn = currentUser && currentUser.user_id === review.user_id;
            const isEditing = editingReviewId === review.review_id;
            return (
              <div key={review.review_id} style={{ padding: 16, background: `rgba(15,15,28,${isOwn ? "0.9" : "0.6"})`, border: `1px solid ${isOwn ? NEON.cyan + "25" : NEON.borderNeon}`, borderRadius: 14, backdropFilter: "blur(8px)", boxShadow: isOwn ? `0 0 15px ${NEON.cyan}08` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: NEON.textPrimary }}>{reviewer?.username || "Unknown"}</span>{isOwn && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${NEON.cyan}15`, color: NEON.cyan, border: `1px solid ${NEON.cyan}25` }}>You</span>}</div>{isEditing ? <StarRating rating={editRating} size={14} interactive onChange={setEditRating} /> : <StarRating rating={review.rating} size={14} />}</div>
                  {isOwn && !isEditing && <div style={{ display: "flex", gap: 6 }}><button onClick={() => { setEditingReviewId(review.review_id); setEditText(review.review_text || ""); setEditRating(review.rating); }} style={{ background: "none", border: "none", cursor: "pointer", color: NEON.textSecondary, padding: 4 }}><Edit3 size={14} /></button><button onClick={() => onDeleteReview(review.review_id)} style={{ background: "none", border: "none", cursor: "pointer", color: NEON.magenta, padding: 4 }}><Trash2 size={14} /></button></div>}
                </div>
                {isEditing ? <div style={{ marginTop: 8 }}><textarea value={editText} onChange={e => setEditText(e.target.value)} style={{ ...inp, minHeight: 60, resize: "vertical" }} /><div style={{ display: "flex", gap: 8, marginTop: 8 }}><button onClick={() => handleEditSave(review.review_id)} style={{ padding: "6px 14px", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.violet})`, color: NEON.bg, border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Save</button><button onClick={() => setEditingReviewId(null)} style={{ padding: "6px 14px", background: `${NEON.textMuted}15`, color: NEON.textSecondary, border: `1px solid ${NEON.borderNeon}`, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Cancel</button></div></div> : review.review_text && <p style={{ margin: "8px 0 0", fontSize: 13, color: NEON.textSecondary, lineHeight: 1.5 }}>{review.review_text}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(mode === "login"); const [username, setUsername] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false); const [error, setError] = useState("");
  const handleSubmit = () => { setError(""); if (isLogin) { if (!username || !password) { setError("Please fill in all fields"); return; } if (!onLogin(username, password)) setError("Invalid username or password"); } else { if (!username || !email || !password) { setError("Please fill in all fields"); return; } if (password.length < 4) { setError("Password must be at least 4 characters"); return; } if (!email.includes("@")) { setError("Please enter a valid email"); return; } if (!onRegister(username, email, password)) setError("Username or email already taken"); } };
  const inp = { width: "100%", padding: "12px 16px", background: `${NEON.bg}CC`, border: `1px solid ${NEON.borderNeon}`, borderRadius: 12, color: NEON.textPrimary, fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: NEON.bgPanel, border: `1px solid ${NEON.violet}30`, borderRadius: 22, padding: 36, width: 400, maxWidth: "90vw", backdropFilter: "blur(20px)", boxShadow: `0 0 60px ${NEON.violet}15, 0 0 120px ${NEON.magenta}08`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 2, background: `linear-gradient(90deg, ${NEON.cyan}, ${NEON.magenta}, ${NEON.amber})`, borderRadius: 2 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.magenta})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{isLogin ? "Welcome Back" : "Join MixMaster"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: NEON.textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        {error && <div style={{ padding: "10px 14px", background: `${NEON.magenta}10`, border: `1px solid ${NEON.magenta}30`, borderRadius: 10, marginBottom: 16, fontSize: 13, color: NEON.magenta, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={{ fontSize: 12, color: NEON.textSecondary, marginBottom: 4, display: "block" }}>Username</label><input value={username} onChange={e => setUsername(e.target.value)} style={inp} onFocus={e => { e.target.style.borderColor = NEON.cyan + "60"; e.target.style.boxShadow = `0 0 15px ${NEON.cyan}15`; }} onBlur={e => { e.target.style.borderColor = NEON.borderNeon; e.target.style.boxShadow = "none"; }} /></div>
          {!isLogin && <div><label style={{ fontSize: 12, color: NEON.textSecondary, marginBottom: 4, display: "block" }}>Email</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inp} onFocus={e => { e.target.style.borderColor = NEON.magenta + "60"; e.target.style.boxShadow = `0 0 15px ${NEON.magenta}15`; }} onBlur={e => { e.target.style.borderColor = NEON.borderNeon; e.target.style.boxShadow = "none"; }} /></div>}
          <div><label style={{ fontSize: 12, color: NEON.textSecondary, marginBottom: 4, display: "block" }}>Password</label><div style={{ position: "relative" }}><input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? "text" : "password"} style={inp} onFocus={e => { e.target.style.borderColor = NEON.violet + "60"; e.target.style.boxShadow = `0 0 15px ${NEON.violet}15`; }} onBlur={e => { e.target.style.borderColor = NEON.borderNeon; e.target.style.boxShadow = "none"; }} /><button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: NEON.textMuted, cursor: "pointer" }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <button onClick={handleSubmit} style={{ width: "100%", padding: "13px", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 4, color: NEON.bg, letterSpacing: "0.03em", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.magenta})`, boxShadow: `0 0 25px ${NEON.cyan}25, 0 0 50px ${NEON.magenta}15` }}>{isLogin ? "Sign In" : "Create Account"}</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{ background: "none", border: "none", color: NEON.violet, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button></div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function MixMasterApp() {
  const [currentUser, setCurrentUser] = useState(null); const [page, setPage] = useState("home"); const [selectedCocktailId, setSelectedCocktailId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); const [showFilters, setShowFilters] = useState(false); const [filterFlavors, setFilterFlavors] = useState([]); const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterLiquor, setFilterLiquor] = useState([]); const [filterIngCount, setFilterIngCount] = useState(""); const [sortBy, setSortBy] = useState("name"); const [showAuthModal, setShowAuthModal] = useState(null);
  const [reviews, setReviews] = useState([...DB.review]); const [favorites, setFavorites] = useState([...DB.user_favorite]); const [users, setUsers] = useState([...DB.app_user]); const [toastMsg, setToastMsg] = useState(null);
  const [cocktails, setCocktails] = useState(DB.cocktail.map(enrichCocktail)); const [dataSource, setDataSource] = useState("demo");
  const nextReviewId = useRef(5011); const nextFavId = useRef(808); const nextUserId = useRef(1008);
  const showToast = useCallback((message, type = "success") => { setToastMsg({ message, type, id: Date.now() }); }, []);

  useEffect(() => {
    let ignore = false;

    const loadCocktails = async () => {
      try {
        const response = await fetch("/api/cocktails");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setCocktails(data.map(cocktail => ({
            ...cocktail,
            image: cocktail.image || COCKTAIL_IMAGES[cocktail.cocktail_id],
            emoji: cocktail.emoji || COCKTAIL_EMOJIS[cocktail.cocktail_id],
          })));
          setReviews(data.flatMap(cocktail => cocktail.reviews || []));
          setDataSource("api");
        }
      } catch {
        if (!ignore) setDataSource("demo");
      }
    };

    loadCocktails();
    return () => { ignore = true; };
  }, []);
  const handleLogin = (username, password) => { const user = users.find(u => u.username === username && u.password_hash === password); if (user) { setCurrentUser(user); setShowAuthModal(null); showToast(`Welcome back, ${user.username}!`); return true; } return false; };
  const handleRegister = (username, email, password) => { if (users.find(u => u.username === username || u.email === email)) return false; const nu = { user_id: nextUserId.current++, username, email, password_hash: password, created_at: new Date().toISOString().split("T")[0] }; setUsers(p => [...p, nu]); DB.app_user.push(nu); setCurrentUser(nu); setShowAuthModal(null); showToast(`Welcome to MixMaster, ${username}!`); return true; };
  const handleLogout = () => { setCurrentUser(null); setPage("home"); showToast("Signed out successfully"); };
  const isFav = (cid) => currentUser && favorites.some(f => f.user_id === currentUser.user_id && f.cocktail_id === cid);
  const toggleFav = (cid) => { if (!currentUser) { setShowAuthModal("login"); return; } const ex = favorites.find(f => f.user_id === currentUser.user_id && f.cocktail_id === cid); if (ex) { setFavorites(p => p.filter(f => f !== ex)); showToast("Removed from favorites"); } else { setFavorites(p => [...p, { favorite_id: nextFavId.current++, user_id: currentUser.user_id, cocktail_id: cid }]); showToast("Added to favorites! ❤️"); } };
  const submitReview = (cid, rating, text) => { if (!currentUser) { setShowAuthModal("login"); return; } setReviews(p => [...p, { review_id: nextReviewId.current++, cocktail_id: cid, user_id: currentUser.user_id, rating, review_text: text, created_at: new Date().toISOString().split("T")[0] }]); showToast("Review submitted! 🍸"); };
  const deleteReview = (rid) => { setReviews(p => p.filter(r => r.review_id !== rid)); showToast("Review deleted"); };
  const editReview = (rid, nr, nt) => { setReviews(p => p.map(r => r.review_id === rid ? { ...r, rating: nr, review_text: nt } : r)); showToast("Review updated!"); };

  const enrichedCocktails = useMemo(() => cocktails.map(c => { const lr = reviews.filter(r => r.cocktail_id === c.cocktail_id); const ar = lr.length ? (lr.reduce((s, r) => s + r.rating, 0) / lr.length) : null; return { ...c, reviews: lr, avgRating: ar }; }), [cocktails, reviews]);
  const filteredCocktails = useMemo(() => { let res = [...enrichedCocktails]; if (searchQuery) { const q = searchQuery.toLowerCase(); res = res.filter(c => c.cocktail_name.toLowerCase().includes(q) || c.cocktail_description.toLowerCase().includes(q) || c.ingredients.some(i => i.name.toLowerCase().includes(q))); } if (filterFlavors.length > 0) res = res.filter(c => filterFlavors.every(fId => c.flavors.some(f => f.flavor_id === fId))); if (filterDifficulty) res = res.filter(c => c.recipe.difficulty === filterDifficulty); if (filterLiquor.length > 0) res = res.filter(c => filterLiquor.some(liq => c.ingredients.some(i => i.type === "Spirit" && i.name === liq))); if (filterIngCount === "few") res.sort((a, b) => a.ingredients.length - b.ingredients.length); else if (filterIngCount === "most") res.sort((a, b) => b.ingredients.length - a.ingredients.length); if (sortBy === "name") res.sort((a, b) => a.cocktail_name.localeCompare(b.cocktail_name)); else if (sortBy === "rating") res.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)); else if (sortBy === "difficulty") res.sort((a, b) => a.recipe.difficulty.localeCompare(b.recipe.difficulty)); return res; }, [enrichedCocktails, searchQuery, filterFlavors, filterDifficulty, filterLiquor, filterIngCount, sortBy]);

  const selectedCocktail = enrichedCocktails.find(c => c.cocktail_id === selectedCocktailId);
  const spirits = DB.ingredient.filter(i => i.ingred_type_id === 1).map(i => i.ingredient_name);
  const favCocktails = currentUser ? enrichedCocktails.filter(c => favorites.some(f => f.user_id === currentUser.user_id && f.cocktail_id === c.cocktail_id)) : [];
  const userRevs = currentUser ? reviews.filter(r => r.user_id === currentUser.user_id) : [];
  const clearFilters = () => { setFilterFlavors([]); setFilterDifficulty(""); setFilterLiquor([]); setFilterIngCount(""); };
  const hasFilters = filterFlavors.length > 0 || filterDifficulty || filterLiquor.length > 0 || filterIngCount;

  return (
    <div style={{ minHeight: "100vh", color: NEON.textPrimary, fontFamily: "'Outfit', sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px,30px); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px,-40px); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        @keyframes neonPulse { 0% { opacity: 0.3; } 100% { opacity: 0.7; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${NEON.violet}40; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: ${NEON.textMuted}; }
      `}</style>
      <NeonBackground />

      <header style={{ padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${NEON.borderNeon}`, background: `linear-gradient(180deg, ${NEON.bgOverlay}, rgba(10,10,20,0.85))`, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, boxShadow: `0 4px 30px rgba(0,0,0,0.4), 0 1px 0 ${NEON.violet}15` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setPage("home"); setSelectedCocktailId(null); }}>
          <span style={{ fontSize: 30, filter: `drop-shadow(0 0 8px ${NEON.magenta}80)` }}>🍸</span>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.magenta}, ${NEON.amber})`, backgroundSize: "200% 100%", animation: "shimmer 6s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MixMaster</h1>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[{ id: "home", label: "Browse", icon: <Search size={14} /> }, { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> }, ...(currentUser ? [{ id: "favorites", label: "Favorites", icon: <Heart size={14} /> }, { id: "myreviews", label: "My Reviews", icon: <MessageSquare size={14} /> }] : [])].map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setSelectedCocktailId(null); }} style={{ background: page === item.id ? `linear-gradient(135deg, ${NEON.cyan}15, ${NEON.magenta}10)` : "transparent", border: `1px solid ${page === item.id ? NEON.cyan + "30" : "transparent"}`, color: page === item.id ? NEON.cyan : NEON.textMuted, padding: "8px 15px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "all 0.3s", textShadow: page === item.id ? `0 0 8px ${NEON.cyan}30` : "none" }}>{item.icon} {item.label}</button>
          ))}
          <div style={{ width: 1, height: 24, background: NEON.borderNeon, margin: "0 8px" }} />
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: NEON.violetSoft, display: "flex", alignItems: "center", gap: 4 }}><User size={14} /> {currentUser.username}</span>
              <button onClick={handleLogout} style={{ background: `${NEON.magenta}10`, border: `1px solid ${NEON.magenta}25`, color: NEON.magenta, padding: "8px 15px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 5 }}><LogOut size={14} /> Sign Out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal("login")} style={{ border: "none", padding: "9px 22px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 5, color: NEON.bg, background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.magenta})`, boxShadow: `0 0 20px ${NEON.cyan}25` }}><LogIn size={14} /> Sign In</button>
          )}
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 32px 60px", position: "relative", zIndex: 1 }}>
        {page === "home" && !selectedCocktailId && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ textAlign: "center", padding: "48px 0 36px" }}>
              <h2 style={{ fontSize: 46, fontWeight: 800, margin: "0 0 14px", fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.cyan} 0%, ${NEON.magenta} 40%, ${NEON.amber} 80%, ${NEON.cyan} 100%)`, backgroundSize: "300% 100%", animation: "shimmer 5s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Discover Your Next Cocktail</h2>
              <p style={{ fontSize: 16, color: NEON.textSecondary, maxWidth: 520, margin: "0 auto" }}>From timeless classics to adventurous new mixes — search, sip, and savor.</p>
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, fontSize: 12, background: dataSource === "api" ? `${NEON.cyan}12` : `${NEON.amber}12`, color: dataSource === "api" ? NEON.cyan : NEON.amber, border: `1px solid ${dataSource === "api" ? NEON.cyan + "30" : NEON.amber + "30"}` }}>
                <span>{dataSource === "api" ? "🟢" : "🟡"}</span>
                {dataSource === "api" ? "Connected to localhost FastAPI + MySQL" : "Demo mode until backend is running"}
              </div>
            </div>
            <div style={{ maxWidth: 620, margin: "0 auto 24px", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: NEON.textMuted }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search cocktails, ingredients..." style={{ width: "100%", padding: "15px 18px 15px 48px", background: NEON.bgCard, border: `1px solid ${NEON.borderNeon}`, borderRadius: 16, color: NEON.textPrimary, fontSize: 15, outline: "none", fontFamily: "'Outfit', sans-serif", backdropFilter: "blur(12px)" }} onFocus={e => { e.target.style.borderColor = NEON.cyan + "50"; e.target.style.boxShadow = `0 0 30px ${NEON.cyan}15`; }} onBlur={e => { e.target.style.borderColor = NEON.borderNeon; e.target.style.boxShadow = "none"; }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters || hasFilters ? `${NEON.violet}10` : "transparent", border: `1px solid ${showFilters || hasFilters ? NEON.violet + "30" : NEON.borderNeon}`, color: hasFilters ? NEON.violet : NEON.textMuted, padding: "8px 14px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 6 }}><Filter size={14} /> Filters {hasFilters && `(${[filterFlavors.length, filterDifficulty ? 1 : 0, filterLiquor.length, filterIngCount ? 1 : 0].reduce((a, b) => a + b, 0)})`} {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                {hasFilters && <button onClick={clearFilters} style={{ background: "none", border: "none", color: NEON.magenta, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Clear all</button>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: NEON.textMuted }}>Sort:</span>
                {["name", "rating", "difficulty"].map(s => (<button key={s} onClick={() => setSortBy(s)} style={{ background: sortBy === s ? `${NEON.cyan}10` : "transparent", border: `1px solid ${sortBy === s ? NEON.cyan + "25" : NEON.borderNeon}`, color: sortBy === s ? NEON.cyan : NEON.textMuted, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif", textTransform: "capitalize" }}>{s}</button>))}
              </div>
            </div>
            {showFilters && (
              <div style={{ padding: 22, marginBottom: 20, borderRadius: 16, animation: "fadeIn 0.2s ease-out", background: `linear-gradient(145deg, rgba(15,15,28,0.8), rgba(10,10,20,0.95))`, border: `1px solid ${NEON.borderNeon}`, backdropFilter: "blur(12px)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: NEON.magenta, marginBottom: 8 }}>Flavors</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{DB.flavor.map(f => { const a = filterFlavors.includes(f.flavor_id); return (<button key={f.flavor_id} onClick={() => setFilterFlavors(p => a ? p.filter(id => id !== f.flavor_id) : [...p, f.flavor_id])} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", background: a ? `${FLAVOR_COLORS[f.flavor_name]}18` : "rgba(255,255,255,0.03)", border: `1px solid ${a ? FLAVOR_COLORS[f.flavor_name] + "50" : NEON.borderNeon}`, color: a ? FLAVOR_COLORS[f.flavor_name] : NEON.textMuted }}>{FLAVOR_ICONS[f.flavor_name]} {f.flavor_name}</button>); })}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: NEON.amber, marginBottom: 8 }}>Difficulty</div><div style={{ display: "flex", gap: 4 }}>{["Simple", "Complex"].map(d => (<button key={d} onClick={() => setFilterDifficulty(p => p === d ? "" : d)} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", background: filterDifficulty === d ? `${DIFFICULTY_COLORS[d]}18` : "rgba(255,255,255,0.03)", border: `1px solid ${filterDifficulty === d ? DIFFICULTY_COLORS[d] + "50" : NEON.borderNeon}`, color: filterDifficulty === d ? DIFFICULTY_COLORS[d] : NEON.textMuted }}>{d}</button>))}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: NEON.cyan, marginBottom: 8 }}>Liquor</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{spirits.map(s => { const a = filterLiquor.includes(s); return (<button key={s} onClick={() => setFilterLiquor(p => a ? p.filter(x => x !== s) : [...p, s])} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", background: a ? `${NEON.cyan}15` : "rgba(255,255,255,0.03)", border: `1px solid ${a ? NEON.cyan + "40" : NEON.borderNeon}`, color: a ? NEON.cyan : NEON.textMuted }}>{s}</button>); })}</div></div>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: NEON.violet, marginBottom: 8 }}>Ingredients</div><div style={{ display: "flex", gap: 4 }}>{[{ key: "few", label: "Fewest First" }, { key: "most", label: "Most First" }].map(o => (<button key={o.key} onClick={() => setFilterIngCount(p => p === o.key ? "" : o.key)} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", background: filterIngCount === o.key ? `${NEON.violet}15` : "rgba(255,255,255,0.03)", border: `1px solid ${filterIngCount === o.key ? NEON.violet + "40" : NEON.borderNeon}`, color: filterIngCount === o.key ? NEON.violet : NEON.textMuted }}>{o.label}</button>))}</div></div>
              </div>
            )}
            <div style={{ fontSize: 13, color: NEON.textMuted, marginBottom: 16 }}>Showing {filteredCocktails.length} cocktail{filteredCocktails.length !== 1 ? "s" : ""}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 22 }}>
              {filteredCocktails.map((c, i) => (<CocktailCard key={c.cocktail_id} cocktail={c} index={i} onClick={() => { setSelectedCocktailId(c.cocktail_id); setPage("home"); }} isFavorited={isFav(c.cocktail_id)} onToggleFavorite={() => toggleFav(c.cocktail_id)} currentUser={currentUser} />))}
            </div>
            {filteredCocktails.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: NEON.textMuted }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div><div style={{ fontSize: 16 }}>No cocktails match your filters</div><button onClick={() => { setSearchQuery(""); clearFilters(); }} style={{ marginTop: 12, background: `${NEON.cyan}10`, border: `1px solid ${NEON.cyan}25`, color: NEON.cyan, padding: "8px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>Clear all filters</button></div>}
          </div>
        )}
        {page === "home" && selectedCocktailId && selectedCocktail && <CocktailDetail cocktail={selectedCocktail} onBack={() => setSelectedCocktailId(null)} currentUser={currentUser} onToggleFavorite={() => toggleFav(selectedCocktailId)} isFavorited={isFav(selectedCocktailId)} reviews={reviews.filter(r => r.cocktail_id === selectedCocktailId)} onSubmitReview={submitReview} onDeleteReview={deleteReview} onEditReview={editReview} toast={showToast} />}
        {page === "favorites" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.magenta}, ${NEON.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>❤️ Your Favorites</h2>
            <p style={{ fontSize: 14, color: NEON.textMuted, margin: "0 0 24px" }}>{favCocktails.length} cocktail{favCocktails.length !== 1 ? "s" : ""} saved</p>
            {favCocktails.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: NEON.textMuted }}><div style={{ fontSize: 48, marginBottom: 12 }}>💔</div><div>No favorites yet. Browse cocktails and tap the heart!</div></div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 22 }}>{favCocktails.map((c, i) => (<CocktailCard key={c.cocktail_id} cocktail={c} index={i} onClick={() => { setSelectedCocktailId(c.cocktail_id); setPage("home"); }} isFavorited={true} onToggleFavorite={() => toggleFav(c.cocktail_id)} currentUser={currentUser} />))}</div>}
          </div>
        )}
        {page === "myreviews" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>💬 My Reviews</h2>
            <p style={{ fontSize: 14, color: NEON.textMuted, margin: "0 0 24px" }}>{userRevs.length} review{userRevs.length !== 1 ? "s" : ""} written</p>
            {userRevs.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: NEON.textMuted }}><div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div><div>You haven't written any reviews yet.</div></div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {userRevs.map(r => { const ct = enrichedCocktails.find(c => c.cocktail_id === r.cocktail_id); return (
                  <div key={r.review_id} style={{ display: "flex", gap: 16, padding: 16, cursor: "pointer", background: NEON.bgCard, border: `1px solid ${NEON.borderNeon}`, borderRadius: 14, backdropFilter: "blur(8px)" }} onClick={() => { setSelectedCocktailId(r.cocktail_id); setPage("home"); }}>
                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg, ${NEON.violet}15, ${NEON.bg})` }}><img src={ct?.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: NEON.textPrimary, marginBottom: 4 }}>{ct?.cocktail_name}</div><StarRating rating={r.rating} size={13} />{r.review_text && <p style={{ margin: "6px 0 0", fontSize: 13, color: NEON.textSecondary }}>{r.review_text}</p>}</div>
                    <button onClick={e => { e.stopPropagation(); deleteReview(r.review_id); }} style={{ background: "none", border: "none", cursor: "pointer", color: NEON.magenta, padding: 4, alignSelf: "flex-start" }}><Trash2 size={14} /></button>
                  </div>
                ); })}
              </div>
            )}
          </div>
        )}
        {page === "analytics" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.amber}, ${NEON.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>📊 MixMaster Analytics</h2>
            <p style={{ fontSize: 14, color: NEON.textMuted, margin: "0 0 24px" }}>Data-driven insights across our cocktail collection</p>
            <AnalyticsDashboard cocktails={enrichedCocktails} />
          </div>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${NEON.borderNeon}`, padding: "20px 32px", textAlign: "center", fontSize: 12, color: NEON.textMuted, position: "relative", zIndex: 1, background: `linear-gradient(180deg, transparent, ${NEON.bg}80)` }}>
        <span style={{ fontFamily: "'Playfair Display', serif", background: `linear-gradient(135deg, ${NEON.cyan}, ${NEON.magenta})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MixMaster</span>
        {" "} — CS5200 Database Management Systems · Northeastern University · PhamJHadawleS · 2026
      </footer>

      {showAuthModal && <AuthModal mode={showAuthModal} onClose={() => setShowAuthModal(null)} onLogin={handleLogin} onRegister={handleRegister} />}
      {toastMsg && <Toast key={toastMsg.id} message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
