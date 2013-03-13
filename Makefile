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

TEMPLATES_CLASS_PATH  = ./soy-functions/closure-templates/build/classes:./soy-functions/closure-templates/java/lib/*:./soy-functions/build/classes:./soy-functions/java/lib/*:./build/tests

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
	svn checkout http://closure-templates.googlecode.com/svn/trunk/ $(TEMPLATE_DIR) && \
	ant -buildfile $(TEMPLATE_DIR)build.xml && \
	ant -buildfile $(TEMPLATE_DIR)build.xml SoyToJsSrcCompiler && \
	cp $(TEMPLATE_DIR)javascript/*.js $(SOY_DIR_IN_PUBLIC)
# Copying javascripts into public directory is temporary step.
# We're going to use Plovr even when developing, so that we can compile sources
# even from ./tools directory directly.

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

compile-soyfunctions:;
	javac \
	-sourcepath ./sources/soyfunctions \
	-classpath "$(TEMPLATE_DIR)java/lib/*:$(TEMPLATE_DIR)build/classes" \
	./sources/soyfunctions/SoyFunctions.java

template:;
	java \
		-cp $(TEMPLATES_CLASS_PATH) \
		com.google.template.soy.SoyToJsSrcCompiler \
		--pluginModules net.stakam.soy.FunctionsModule \
		--srcs ./sources/soy/main.soy \
		--allowExternalCalls false \
		--shouldProvideRequireSoyNamespaces \
		--shouldGenerateJsdoc \
		--outputPathFormat ./public/app/soy/main.js



calcdeps:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=list \
	> scripts/_scripts && \
	node scripts/generatescriptjade.js scripts/_scripts \
	> views/_scripts.jade && \
	rm scripts/_scripts
