from database import conectar


def listar():
    conexion = conectar()
    cursor = conexion.cursor()
    # Orden alfabético, dejando "Otros productos" al final
    cursor.execute("SELECT id, nombre FROM categorias ORDER BY id = 'otros', nombre")
    categorias = cursor.fetchall()
    conexion.close()
    return categorias


def existe(categoria_id):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT id FROM categorias WHERE id = %s", (categoria_id,))
    fila = cursor.fetchone()
    conexion.close()
    return fila is not None