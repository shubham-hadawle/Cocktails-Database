from collections import defaultdict
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .db import engine

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


@app.get('/health')
def healthcheck() -> dict[str, str]:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    return {'status': 'ok'}


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


@app.get('/api/analytics/summary')
def get_summary() -> dict[str, Any]:
    cocktails = _load_cocktails()
    avg_rating_values = [c['avgRating'] for c in cocktails if c['avgRating'] is not None]
    return {
        'cocktail_count': len(cocktails),
        'review_count': sum(len(c['reviews']) for c in cocktails),
        'average_rating': round(sum(avg_rating_values) / len(avg_rating_values), 2) if avg_rating_values else None,
    }
