#######################################################################
#
#
#
#######################################################################

USAGE_TEXT="\n
    ---- Usage ---- \n\n\
    $ ./run.sh setup\t# Fetch libraries.\n
    $ ./run.sh soyweb\t# Start soyweb server for development.\n
    $ ./run.sh sass\t# Start to watch sass for development.\n
    $ ./run.sh serve\t# Start JavaScript server for development.\n
    $ ./run.sh build\t# Build JavaScript and CSS for production.\n
        \n"


LIBS_DIR=libs/

PLOVR_DIR=${LIBS_DIR}plovr/
PLOVR_REMOTE_DIR=http://plovr.googlecode.com/files/
PLOVR_JAR=plovr-eba786b34df9.jar
PLOVR_JAR_PATH=${PLOVR_DIR}${PLOVR_JAR}

SELENIUMSERVER_REMOTE_JAR=https://selenium.googlecode.com/files/selenium-server-standalone-2.32.0.jar
SELENIUMSERVER_DIR=${LIBS_DIR}selenium-server/

CLOSURELIBRARY_DIR=${LIBS_DIR}closure-library/
CLOSURELIBRARY_REMOTE_DIR=http://closure-library.googlecode.com/svn/trunk/

CLOSURETEMPLATE_DIR=${LIBS_DIR}closure-template/
CLOSURETEMPLATE_REMOTE_DIR=http://closure-templates.googlecode.com/svn/trunk/

CLOSURESTYLESHEETS_JAR=closure-stylesheets-20111230.jar
CLOSURESTYLESHEETS_DIR=${LIBS_DIR}closure-stylesheets/
CLOSURESTYLESHEETS_REMOTE_DIR=https://closure-stylesheets.googlecode.com/files/
CLOSURESTYLESHEETS_JAR_PATH=${CLOSURESTYLESHEETS_DIR}${CLOSURESTYLESHEETS_JAR}


case $1 in
    setup)
        mkdir ${LIBS_DIR} > /dev/null 2>&1
        PWD=`pwd`

        # Download plovr
        rm -rf ${PLOVR_DIR}
        wget -P ${PLOVR_DIR} ${PLOVR_REMOTE_DIR}${PLOVR_JAR}

        # Download Closure Library
        rm -rf ${CLOSURELIBRARY_DIR}
        svn co -r 2519 ${CLOSURELIBRARY_REMOTE_DIR} ${LIBS_DIR}closure-library

        # Download Closure Stylesheets
        rm -rf ${CLOSURESTYLESHEETS_DIR}
        wget -P ${CLOSURESTYLESHEETS_DIR} --no-check-certificate ${CLOSURESTYLESHEETS_REMOTE_DIR}${CLOSURESTYLESHEETS_JAR}

        # Download Selenium Server
        rm -rf ${SELENIUMSERVER_DIR}
        wget -P ${SELENIUMSERVER_DIR} --no-check-certificate ${SELENIUMSERVER_REMOTE_JAR}

        ;;

    soyweb)
        java -jar ${PLOVR_JAR_PATH} soyweb --dir ./public
        ;;

    sass)
        sass --watch public/sass/main.sass:public/stylesheets/main.css
        ;;

    serve)
        java -jar ${PLOVR_JAR_PATH} serve plovr.json
        ;;

    all)
        redis-server redis.conf
        mongod &
        ./run.sh soyweb &
        ./run.sh sass &
        ./run.sh serve &
        java -jar libs/selenium-server/selenium-server-standalone-2.32.0.jar &
        ;;

    killall)
        pidof mongo | xargs kill -9
        pidof ruby | xargs kill -9
        pidof java | xargs kill -9
        ;;

    hosts_on)
        sudo sed -i -e 's/^# \(127.*nu-minor.com\)/\1/' /etc/hosts
        ;;

    hosts_off)
        sudo sed -i -e 's/^\(127.*nu-minor.com\)/# \1/' /etc/hosts
        ;;

    build)
        # JavaScript
        java -jar ${PLOVR_JAR_PATH} build plovr.json
        # CSS
        sass -t compressed public/sass/main.sass:public/stylesheets/main-min.css
        ;;

    *)
        echo -e $USAGE_TEXT
        ;;
esac
