COMPILER_ZIP					= compiler-latest.zip
COMPILER_REMOTE_DIR		= http://closure-compiler.googlecode.com/files/$(COMPILER_ZIP)
COMPILER_DIR					= tools/closure-compiler/
COMPILER_JAR					= $(COMPILER_DIR)/compiler.jar
TEMPLATE_ZIP					= closure-templates-for-javascript-latest.zip
TEMPLATE_REMOTE_DIR		= http://closure-templates.googlecode.com/files/$(TEMPLATE_ZIP)
TEMPLATE_DIR					= tools/closure-template/
TEMPLATE_JAR					= $(TEMPLATE_DIR)/SoyToJsSrcCompiler.jar
SOY_DIR_IN_PUBLIC			= ./public/app/soy/
SELENIUM_JAR					= selenium-server-standalone-2.29.0.jar
SELENIUM_REMOTE_JAR		= http://selenium.googlecode.com/files/$(SELENIUM_JAR)
SELENIUM_DIR					= tools/selenium/
CLOSURELIB_DIR        = ./public/closure-library
CLOSURELIB_REMOTE_DIR = http://closure-library.googlecode.com/svn/trunk/
PLOVR_JAR        = plovr-eba786b34df9.jar
PLOVR_REMOTE_JAR = http://plovr.googlecode.com/files/$(PLOVR_JAR)
PLOVR_DIR = tools/plovr/

# For development, I keep using `calcdeps' command in order to 
# load javascript files directory from a browser where compilation
# is not needed. Maybe I should use plovr for that later.
COMMAND_CLOSURE_BUILDER_ = $(CLOSURELIB_DIR)/closure/bin/build/closurebuilder.py \
	--root=$(CLOSURELIB_DIR) \
	--root=public/closure-thirdparty/closure-scroller/piglovesyou \
	--root=public/closure-thirdparty/closure-thousandrows/piglovesyou \
	--root=public/app \
	--root=public/javascripts \
	--namespace="main" \
	--compiler_jar=$(COMPILER_JAR) \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--warning_level=VERBOSE"



setup: setup-closurecompiler setup-closuretemplate setup-plovr setup-selenium setup-closurelibrary setup-thirdpartymodule

setup-closurecompiler:;
	rm -rf $(COMPILER_DIR) && \
	wget -P $(COMPILER_DIR) $(COMPILER_REMOTE_DIR) && \
	unzip -d $(COMPILER_DIR) $(COMPILER_DIR)$(COMPILER_ZIP) && \
	rm $(COMPILER_DIR)$(COMPILER_ZIP)

setup-closuretemplate:;
	rm -rf $(TEMPLATE_DIR) && \
	wget -P $(TEMPLATE_DIR) $(TEMPLATE_REMOTE_DIR) && \
	unzip -d $(TEMPLATE_DIR) $(TEMPLATE_DIR)$(TEMPLATE_ZIP) && \
	rm $(TEMPLATE_DIR)$(TEMPLATE_ZIP) && \
	cp $(TEMPLATE_DIR)*.js $(SOY_DIR_IN_PUBLIC)

setup-plovr:;
	rm -rf $(PLOVR_DIR) && \
	wget -P $(PLOVR_DIR) $(PLOVR_REMOTE_JAR)

setup-selenium:;
	rm -rf $(SELENIUM_DIR) && \
	wget -P $(SELENIUM_DIR) $(SELENIUM_REMOTE_JAR)

setup-closurelibrary:;
	rm -rf $(CLOSURELIB_DIR)
	svn checkout $(CLOSURELIB_REMOTE_DIR) $(CLOSURELIB_DIR)

setup-thirdpartymodule:;
	git submodule init && \
	git submodule update && \
	git submodule foreach 'git fetch; git checkout master; git pull;'



compile:;
	java -jar $(PLOVR_DIR)$(PLOVR_JAR) build plovr.json

template:;
	java -jar $(TEMPLATE_JAR) \
	--outputPathFormat public/app/soy/yeah.js \
	--srcs public/app/soy/yeah.soy \
	--shouldGenerateJsdoc \
	--shouldProvideRequireSoyNamespaces


calcdeps:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=list \
	> scripts/_scripts && \
	node scripts/generatescriptjade.js scripts/_scripts \
	> views/_scripts.jade && \
	rm scripts/_scripts
