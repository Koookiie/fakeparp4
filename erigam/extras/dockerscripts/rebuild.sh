source .dockerenv
CONTAINER_IMAGE='erigam'

update_image () {
	cd erigam
	git pull

	sudo docker build --force-rm -t $CONTAINER_IMAGE .
}

boot_container () {
	CONTAINER_NAME="$1"
	COMMAND="$2"

	sudo docker stop $CONTAINER_NAME
	sudo docker rm $CONTAINER_NAME

	sudo docker run -d $ENV --name=$CONTAINER_NAME $CONTAINER_IMAGE $COMMAND
}

update_image

boot_container "erigam_web" "gunicorn -b 0.0.0.0:5000 -k gevent -w 4 erigam:app"
boot_container "erigam_archiver" "python erigam/archiver.py"
boot_container "erigam_reaper" "python erigam/reaper.py"
boot_container "erigam_matchmaker" "python erigam/reaper.py"
