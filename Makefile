all: set_ip start

start:
	@if [ -f .env ]; then\
		docker-compose up;\
	else\
		echo "Missing env file, creating one...";\
		touch .env;\
		echo "But it's empty :c";\
	fi

stop:
	docker-compose down

set_ip:
	rm ./client/.env;\
	echo -n "VITE_LOCALHOST=" > ./client/.env;\
	hostname -i >> ./client/.env;\

clean:	
	docker-compose down -v --rmi all

vclean:
	docker rm postgres
	docker volume rm $$(docker volume ls -q)

# build docker, need to rebuild to install new packages
client-build:
	docker build ./client -t vuejs

# launch docker, need to have build at least once
client:
	# npm install --prefix client/
	# npm run lint --prefix client/
	# npm run dev --prefix client/
	docker run --rm -v $(PWD)/client/src:/app/src -p 5173:5173 vuejs

server:
	npm install --prefix server/
	npm run start:dev --prefix server/

.PHONY: client server