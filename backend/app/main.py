from collections import defaultdict
from typing import Any
from datetime import datetime
from pydantic import BaseModel

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .db import engine


# ── Pydantic request models ──────────────────────────────────

class ReviewRequest(BaseModel):
    cocktail_id: int
    user_id: int
    rating: float
    review_text: str


class ReviewUpdate(BaseModel):
    rating: float
    review_text: str


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class FavoriteRequest(BaseModel):
    user_id: int
    cocktail_id: int


# ── App setup ────────────────────────────────────────────────

app = FastAPI(title='MixMaster API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# ── Helpers ──────────────────────────────────────────────────

def _rows_to_dicts(result) -> list[dict[str, Any]]:
    return [dict(row._mapping) for row in result]


def _load_cocktails() -> list[dict[str, Any]]:
    with engine.begin() as conn:
        cocktails = _rows_to_dicts(
            conn.execute(
                text(
                    '''
                    SELECT
                        c.cocktail_id,
                        c.cocktail_name,
                        c.cocktail_description,
                        c.cocktail_image_url,
                        r.recipe_id,
                        r.instructions,
                        r.difficulty,
                        g.glass_type_id,
                        g.glass_type_name,
                        g.glass_type_description
                    FROM cocktail AS c
                    JOIN recipe AS r ON r.recipe_id = c.recipe_id
                    JOIN glass_type AS g ON g.glass_type_id = c.glass_type_id
                    ORDER BY c.cocktail_name
                    '''
                )
            )
        )
        flavors = _rows_to_dicts(
            conn.execute(
                text(
                    '''
                    SELECT cf.cocktail_id, f.flavor_id, f.flavor_name
                    FROM cocktail_flavor AS cf
                    JOIN flavor AS f ON f.flavor_id = cf.flavor_id
                    '''
                )
            )
        )
        tools = _rows_to_dicts(
            conn.execute(
                text(
                    '''
                    SELECT c.cocktail_id, t.tool_id, t.tool_name, t.tool_description
                    FROM cocktail AS c
                    JOIN recipe_tool AS rt ON rt.recipe_id = c.recipe_id
                    JOIN tool AS t ON t.tool_id = rt.tool_id
                    '''
                )
            )
        )
        ingredients = _rows_to_dicts(
            conn.execute(
                text(
                    '''
                    SELECT
                        c.cocktail_id,
                        i.ingredient_id,
                        i.ingredient_name AS name,
                        it.ingred_type_name AS type,
                        ri.quantity,
                        ri.unit
                    FROM cocktail AS c
                    JOIN recipe_ingredient AS ri ON ri.recipe_id = c.recipe_id
                    JOIN ingredient AS i ON i.ingredient_id = ri.ingredient_id
                    JOIN ingredient_type AS it ON it.ingred_type_id = i.ingred_type_id
                    '''
                )
            )
        )
        reviews = _rows_to_dicts(
            conn.execute(
                text(
                    '''
                    SELECT review_id, cocktail_id, user_id, rating, review_text, created_at
                    FROM review
                    ORDER BY created_at DESC
                    '''
                )
            )
        )

    flavor_map: dict[int, list[dict[str, Any]]] = defaultdict(list)
    tool_map: dict[int, list[dict[str, Any]]] = defaultdict(list)
    ingredient_map: dict[int, list[dict[str, Any]]] = defaultdict(list)
    review_map: dict[int, list[dict[str, Any]]] = defaultdict(list)

    for row in flavors:
        flavor_map[row['cocktail_id']].append({
            'flavor_id': row['flavor_id'],
            'flavor_name': row['flavor_name'],
        })

    for row in tools:
        tool_map[row['cocktail_id']].append({
            'tool_id': row['tool_id'],
            'tool_name': row['tool_name'],
            'tool_description': row['tool_description'],
        })

    for row in ingredients:
        ingredient_map[row['cocktail_id']].append({
            'ingredient_id': row['ingredient_id'],
            'name': row['name'],
            'type': row['type'],
            'quantity': float(row['quantity']),
            'unit': row['unit'],
        })

    for row in reviews:
        review_map[row['cocktail_id']].append({
            'review_id': row['review_id'],
            'cocktail_id': row['cocktail_id'],
            'user_id': row['user_id'],
            'rating': float(row['rating']),
            'review_text': row['review_text'],
            'created_at': str(row['created_at']),
        })

    payload = []
    for cocktail in cocktails:
        cocktail_reviews = review_map[cocktail['cocktail_id']]
        avg_rating = None
        if cocktail_reviews:
            avg_rating = round(sum(r['rating'] for r in cocktail_reviews) / len(cocktail_reviews), 2)

        payload.append(
            {
                'cocktail_id': cocktail['cocktail_id'],
                'cocktail_name': cocktail['cocktail_name'],
                'cocktail_description': cocktail['cocktail_description'],
                'image': cocktail['cocktail_image_url'],
                'recipe': {
                    'recipe_id': cocktail['recipe_id'],
                    'instructions': cocktail['instructions'],
                    'difficulty': cocktail['difficulty'],
                },
                'glass': {
                    'glass_type_id': cocktail['glass_type_id'],
                    'glass_type_name': cocktail['glass_type_name'],
                    'glass_type_description': cocktail['glass_type_description'],
                },
                'flavors': flavor_map[cocktail['cocktail_id']],
                'tools': tool_map[cocktail['cocktail_id']],
                'ingredients': ingredient_map[cocktail['cocktail_id']],
                'reviews': cocktail_reviews,
                'avgRating': avg_rating,
            }
        )

    return payload


# ── Health ───────────────────────────────────────────────────

@app.get('/health')
def healthcheck() -> dict[str, str]:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    return {'status': 'ok'}


# ── Cocktails ────────────────────────────────────────────────

@app.get('/api/cocktails')
def get_cocktails(q: str | None = Query(default=None)) -> list[dict[str, Any]]:
    cocktails = _load_cocktails()
    if not q:
        return cocktails

    search = q.strip().lower()
    return [
        cocktail
        for cocktail in cocktails
        if search in cocktail['cocktail_name'].lower()
        or search in (cocktail['cocktail_description'] or '').lower()
        or any(search in ingredient['name'].lower() for ingredient in cocktail['ingredients'])
    ]


@app.get('/api/cocktails/{cocktail_id}')
def get_cocktail(cocktail_id: int) -> dict[str, Any]:
    for cocktail in _load_cocktails():
        if cocktail['cocktail_id'] == cocktail_id:
            return cocktail
    raise HTTPException(status_code=404, detail='Cocktail not found')


# ── Analytics ────────────────────────────────────────────────

@app.get('/api/analytics/summary')
def get_summary() -> dict[str, Any]:
    cocktails = _load_cocktails()
    avg_rating_values = [c['avgRating'] for c in cocktails if c['avgRating'] is not None]
    return {
        'cocktail_count': len(cocktails),
        'review_count': sum(len(c['reviews']) for c in cocktails),
        'average_rating': round(sum(avg_rating_values) / len(avg_rating_values), 2) if avg_rating_values else None,
    }


# ── Reviews (CRUD) ───────────────────────────────────────────

@app.post('/api/reviews')
def create_review(review: ReviewRequest) -> dict[str, Any]:
    """Create — submit a new review for a cocktail."""
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text('SELECT cocktail_id FROM cocktail WHERE cocktail_id = :cid'),
                {'cid': review.cocktail_id}
            ).fetchone()
            if not result:
                raise HTTPException(status_code=404, detail='Cocktail not found')

            result = conn.execute(
                text('SELECT user_id FROM app_user WHERE user_id = :uid'),
                {'uid': review.user_id}
            ).fetchone()
            if not result:
                raise HTTPException(status_code=404, detail='User not found')

            existing = conn.execute(
                text('''SELECT review_id FROM review
                       WHERE cocktail_id = :cid AND user_id = :uid'''),
                {'cid': review.cocktail_id, 'uid': review.user_id}
            ).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail='You have already reviewed this cocktail')

            current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            conn.execute(
                text('''INSERT INTO review (cocktail_id, user_id, rating, review_text, created_at)
                       VALUES (:cid, :uid, :rating, :text, :date)'''),
                {
                    'cid': review.cocktail_id,
                    'uid': review.user_id,
                    'rating': review.rating,
                    'text': review.review_text,
                    'date': current_date,
                }
            )

            result = conn.execute(
                text('''SELECT review_id, cocktail_id, user_id, rating, review_text, created_at
                       FROM review
                       WHERE cocktail_id = :cid AND user_id = :uid
                       ORDER BY created_at DESC LIMIT 1'''),
                {'cid': review.cocktail_id, 'uid': review.user_id}
            ).fetchone()

            if result:
                row = dict(result._mapping)
                row['rating'] = float(row['rating'])
                row['created_at'] = str(row['created_at'])
                return row
            raise HTTPException(status_code=400, detail='Failed to create review')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put('/api/reviews/{review_id}')
def update_review(review_id: int, update: ReviewUpdate) -> dict[str, Any]:
    """Update — edit an existing review."""
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text('SELECT review_id FROM review WHERE review_id = :rid'),
                {'rid': review_id}
            ).fetchone()
            if not result:
                raise HTTPException(status_code=404, detail='Review not found')

            conn.execute(
                text('''UPDATE review
                       SET rating = :rating, review_text = :text
                       WHERE review_id = :rid'''),
                {'rid': review_id, 'rating': update.rating, 'text': update.review_text}
            )

            result = conn.execute(
                text('''SELECT review_id, cocktail_id, user_id, rating, review_text, created_at
                       FROM review WHERE review_id = :rid'''),
                {'rid': review_id}
            ).fetchone()

            row = dict(result._mapping)
            row['rating'] = float(row['rating'])
            row['created_at'] = str(row['created_at'])
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete('/api/reviews/{review_id}')
def delete_review(review_id: int) -> dict[str, str]:
    """Delete — remove a review."""
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text('SELECT review_id FROM review WHERE review_id = :rid'),
                {'rid': review_id}
            ).fetchone()
            if not result:
                raise HTTPException(status_code=404, detail='Review not found')

            conn.execute(
                text('DELETE FROM review WHERE review_id = :rid'),
                {'rid': review_id}
            )
            return {'message': 'Review deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Auth (login / register) ─────────────────────────────────

@app.post('/api/auth/login')
def login(req: LoginRequest) -> dict[str, Any]:
    """Authenticate a user by username + password."""
    with engine.begin() as conn:
        result = conn.execute(
            text('''SELECT user_id, username, email, password_hash, created_at
                   FROM app_user
                   WHERE username = :u AND password_hash = :p'''),
            {'u': req.username, 'p': req.password}
        ).fetchone()

        if not result:
            raise HTTPException(status_code=401, detail='Invalid username or password')

        row = dict(result._mapping)
        row['created_at'] = str(row['created_at'])
        return row


@app.post('/api/auth/register')
def register(req: RegisterRequest) -> dict[str, Any]:
    """Create a new user account."""
    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text('''SELECT user_id FROM app_user
                       WHERE username = :u OR email = :e'''),
                {'u': req.username, 'e': req.email}
            ).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail='Username or email already taken')

            conn.execute(
                text('''INSERT INTO app_user (username, email, password_hash)
                       VALUES (:u, :e, :p)'''),
                {'u': req.username, 'e': req.email, 'p': req.password}
            )

            result = conn.execute(
                text('''SELECT user_id, username, email, password_hash, created_at
                       FROM app_user WHERE username = :u'''),
                {'u': req.username}
            ).fetchone()

            row = dict(result._mapping)
            row['created_at'] = str(row['created_at'])
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Favorites (CRUD) ────────────────────────────────────────

@app.get('/api/favorites/{user_id}')
def get_favorites(user_id: int) -> list[dict[str, Any]]:
    """Read — get all favorites for a user."""
    with engine.begin() as conn:
        rows = _rows_to_dicts(
            conn.execute(
                text('''SELECT favorite_id, user_id, cocktail_id
                       FROM user_favorite WHERE user_id = :uid'''),
                {'uid': user_id}
            )
        )
    return rows


@app.post('/api/favorites')
def add_favorite(req: FavoriteRequest) -> dict[str, Any]:
    """Create — add a cocktail to the user's favorites."""
    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text('''SELECT favorite_id FROM user_favorite
                       WHERE user_id = :uid AND cocktail_id = :cid'''),
                {'uid': req.user_id, 'cid': req.cocktail_id}
            ).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail='Already in favorites')

            conn.execute(
                text('''INSERT INTO user_favorite (user_id, cocktail_id)
                       VALUES (:uid, :cid)'''),
                {'uid': req.user_id, 'cid': req.cocktail_id}
            )

            result = conn.execute(
                text('''SELECT favorite_id, user_id, cocktail_id
                       FROM user_favorite
                       WHERE user_id = :uid AND cocktail_id = :cid'''),
                {'uid': req.user_id, 'cid': req.cocktail_id}
            ).fetchone()

            return dict(result._mapping)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete('/api/favorites/{user_id}/{cocktail_id}')
def remove_favorite(user_id: int, cocktail_id: int) -> dict[str, str]:
    """Delete — remove a cocktail from the user's favorites."""
    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text('''SELECT favorite_id FROM user_favorite
                       WHERE user_id = :uid AND cocktail_id = :cid'''),
                {'uid': user_id, 'cid': cocktail_id}
            ).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail='Favorite not found')

            conn.execute(
                text('''DELETE FROM user_favorite
                       WHERE user_id = :uid AND cocktail_id = :cid'''),
                {'uid': user_id, 'cid': cocktail_id}
            )
            return {'message': 'Removed from favorites'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Users (read-only, for review display) ────────────────────

@app.get('/api/users')
def get_users() -> list[dict[str, Any]]:
    """Read all users (for displaying reviewer names)."""
    with engine.begin() as conn:
        rows = _rows_to_dicts(
            conn.execute(
                text('''SELECT user_id, username, email, created_at
                       FROM app_user ORDER BY username''')
            )
        )
    for row in rows:
        row['created_at'] = str(row['created_at'])
    return rows
