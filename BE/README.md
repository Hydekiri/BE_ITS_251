1. docker compose up -d --build
2. docker compose up -d
3. docker compose down

#thêm dữ liệu => qua git bash r sài
# Cấu trúc DB
docker exec -i be-db-1 psql -U its -d its_db < src/config/db.sql



# Dữ liệu mẫu
docker exec -i be-db-1 psql -U its -d its_db < src/config/data.sql


