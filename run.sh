#######################################################################
#
#
#
#######################################################################

USAGE_TEXT="\n
    ---- Pass one of them ---- \n\n\
    setup\n\
    setup_closurelibrary\n\
    setup_closurestylesheets\n\
    setup_closuretemplates\n\
    cleanup_lib\n\
    soyweb\n\
    serve\n\
    build\n\
    extract_msg\n\
        \n"

LIBS_DIR=libs/

PLOVR_JAR_PATH=./node_modules/plovr/bin/plovr.jar

CLOSURELIBRARY_DIR=${LIBS_DIR}closure-library/
CLOSURELIBRARY_REMOTE_ZIP=https://github.com/google/closure-library/archive/master.zip

CLOSURESTYLESHEETS_JAR=closure-stylesheets-20111230.jar
CLOSURESTYLESHEETS_DIR=${LIBS_DIR}closure-stylesheets/
CLOSURESTYLESHEETS_REMOTE_DIR=https://closure-stylesheets.googlecode.com/files/
CLOSURESTYLESHEETS_JAR_PATH=${CLOSURESTYLESHEETS_DIR}${CLOSURESTYLESHEETS_JAR}

CLOSURETEMPLATES_DIR=${LIBS_DIR}closure-template/
CLOSURETEMPLATES_REMOTE_DIR=http://closure-templates.googlecode.com/files/
CLOSURETEMPLATES_FOR_JAVA=closure-templates-for-java-latest.zip
CLOSURETEMPLATES_FOR_JS=closure-templates-for-javascript-latest.zip
CLOSURETEMPLATES_MSG_EXTRACTOR=closure-templates-msg-extractor-latest.zip
CLOSURETEMPLATES_SOY_TO_JS_JAR=SoyToJsSrcCompiler.jar 
CLOSURETEMPLATES_SOY_MSG_EXTRACTOR_JAR=SoyMsgExtractor.jar

CLOSURECOMPILER_DIR=${LIBS_DIR}closure-compiler/
CLOSURECOMPILER_REMOTE_DIR=http://dl.google.com/closure-compiler/
CLOSURECOMPILER_ZIP=compiler-latest.zip


cleanup_lib() {
    mkdir ${LIBS_DIR} > /dev/null 2>&1
}

setup_closurelibrary() {
    rm -rf ${CLOSURELIBRARY_DIR}
    mkdir -p $LIBS_DIR
    (cd ${LIBS_DIR} && wget ${CLOSURELIBRARY_REMOTE_ZIP} && unzip master.zip && mv closure-library-master closure-library && rm master.zip)
}

setup_closurestylesheets() {
    rm -rf ${CLOSURESTYLESHEETS_DIR}
    wget -P ${CLOSURESTYLESHEETS_DIR} --no-check-certificate ${CLOSURESTYLESHEETS_REMOTE_DIR}${CLOSURESTYLESHEETS_JAR}
}

wget_unzip_rm() {
    # $1: remote dir
    # $2: zip file name
    # $3: dir extracting into
    wget ${1}${2}
    mkdir -p $3
    unzip -d $3 $2
    rm $2
}

setup_closuretemplates() {
    rm -rf ${CLOSURETEMPLATES_DIR}
    wget_unzip_rm $CLOSURETEMPLATES_REMOTE_DIR $CLOSURETEMPLATES_FOR_JAVA ${CLOSURETEMPLATES_DIR}java
    wget_unzip_rm $CLOSURETEMPLATES_REMOTE_DIR $CLOSURETEMPLATES_FOR_JS ${CLOSURETEMPLATES_DIR}js
    wget_unzip_rm $CLOSURETEMPLATES_REMOTE_DIR $CLOSURETEMPLATES_MSG_EXTRACTOR ${CLOSURETEMPLATES_DIR}msg
}

setup_closurecompiler() {
    wget_unzip_rm $CLOSURECOMPILER_REMOTE_DIR $CLOSURECOMPILER_ZIP $CLOSURECOMPILER_DIR
}

soyfiles() {
    find "public/app/soy/" -name "*.soy"
}

extract_msg() {
    java -jar \
        ${CLOSURETEMPLATES_DIR}msg/${CLOSURETEMPLATES_SOY_MSG_EXTRACTOR_JAR} \
        --sourceLocaleString en \
        --outputFile extracted_en.xlf $(soyfiles)
    [ $? -eq 0 ] && echo "created."
}


SOLR_VERSION=4.7.2
SOLR_REMOTE=http://ftp.kddilabs.jp/infosystems/apache/lucene/solr/${SOLR_VERSION}/solr-${SOLR_VERSION}.tgz
SOLR_DIR=$LIBS_DIR/solr-${SOLR_VERSION}

# for linux
setup_solr() {
    PWD=`pwd`
    cd $LIBS_DIR
    wget $SOLR_REMOTE -O - | tar zxvf -
    cd $PWD
}

solr() {
    if [[ `uname` -eq Linux ]]; then
        java \
            -Dsolr.solr.home="./solr/" \
            -Djetty.home="${SOLR_DIR}/example/" \
            -jar ${SOLR_DIR}/example/start.jar
    elif [[ `uname` -eq Darwin ]]; then
        solr `pwd`/solr
    fi
}



case $1 in

    setup)
        cleanup_lib
        setup_closurelibrary
        setup_solr
        # setup_closurestylesheets
        # setup_closuretemplates
        # setup_closurecompiler
        ;;
    cleanup_lib) cleanup_lib;;
    setup_closurelibrary) setup_closurelibrary;;
    setup_closurestylesheets) setup_closurestylesheets;;
    setup_closuretemplates) setup_closuretemplates;;
    setup_closurecompiler) setup_closurecompiler;;
    setup_solr) setup_solr;;

    soyweb) java -jar ${PLOVR_JAR_PATH} soyweb --dir ./public;;

    serve) java -jar ${PLOVR_JAR_PATH} serve plovr.json;;

    build) java -jar ${PLOVR_JAR_PATH} build plovr.json;;

    extract_msg) extract_msg;;

    soyweb) java -jar ${PLOVR_JAR_PATH} soyweb --dir ./public;;

    solr) solr;;

    serve) java -jar ${PLOVR_JAR_PATH} serve plovr.json;;

    serve_playground) java -jar ${PLOVR_JAR_PATH} serve playground_plovr.json;;

    *) echo -e $USAGE_TEXT;;

esac

