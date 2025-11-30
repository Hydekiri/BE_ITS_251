1. docker compose up --build -d
2. docker compose up -d
3. docker compose down

#thêm dữ liệu => qua git bash r sài
4. docker exec -i be-db-1 psql -U soba -d soba_db < src/config/db.sql
5. docker exec -i be-db-1 psql -U soba -d soba_db < src/config/data.sql
