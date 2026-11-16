# Conexión a PostgreSQL. Es el mismo patrón de la guía de FastAPI con sqlite3
# (conectar -> cursor -> execute -> commit -> close), pero con psycopg2,
# que es la librería para conectarse a PostgreSQL desde Python.
import os

import psycopg2
from psycopg2.extras import RealDictCursor

# Datos de conexión: se leen del archivo .env (ver .env.example).
# La contraseña de la base nunca se escribe en el código.
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "infraganti")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def conectar():
    # RealDictCursor entrega cada fila como diccionario: fila["id"], fila["nombre"]...
    # Cumple el mismo papel que conexion.row_factory = sqlite3.Row en la guía.
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor,
    )
