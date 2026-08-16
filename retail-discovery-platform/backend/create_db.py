import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to the default 'postgres' database
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='123',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if d4d database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'd4d';")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE d4d;")
            print("Database 'd4d' created successfully!")
        else:
            print("Database 'd4d' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print("Error creating database:", e)

if __name__ == '__main__':
    create_database()
