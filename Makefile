COMPILER_ZIP					= compiler-latest.zip
COMPILER_REMOTE_DIR		= http://closure-compiler.googlecode.com/files/$(COMPILER_ZIP)
COMPILER_DIR					= closure-compiler/
COMPILER_JAR					= $(COMPILER_DIR)/compiler.jar
CLOSURELIB_DIR        = ./public/closure-library
CLOSURELIB_REMOTE_DIR = http://closure-library.googlecode.com/svn/trunk/
JSDOCTOOLKIT          = jsdoc_toolkit-2.4.0
JSDOCTOOLKIT_DIR      = jsdoc-toolkit
JSDOCTOOLKIT_REMOTEDIR= http://jsdoc-toolkit.googlecode.com/files/

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




setup: setup-closurecompiler setup-closurelibrary setup-jsdoctoolkit

setup-closurecompiler:;
	rm -rf $(COMPILER_DIR) && \
	wget -P $(COMPILER_DIR) $(COMPILER_REMOTE_DIR) && \
	unzip -d $(COMPILER_DIR) $(COMPILER_DIR)$(COMPILER_ZIP) && \
	rm $(COMPILER_DIR)$(COMPILER_ZIP)

setup-closurelibrary:;
	rm -rf $(CLOSURELIB_DIR)
	svn checkout $(CLOSURELIB_REMOTE_DIR) $(CLOSURELIB_DIR) && \
	git submodule init && \
	git submodule update

setup-jsdoctoolkit:;
	rm -rf $(JSDOCTOOLKIT_DIR) && \
	wget $(JSDOCTOOLKIT_REMOTEDIR)$(JSDOCTOOLKIT).zip && \
	unzip $(JSDOCTOOLKIT).zip && \
	mv $(JSDOCTOOLKIT)/$(JSDOCTOOLKIT_DIR) ./ && \
	rm $(JSDOCTOOLKIT).zip && \
	rm -rf $(JSDOCTOOLKIT)
 


compile:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=compiled \
	> public/javascripts/main-min.js

calcdeps:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=list \
	> scripts/scriptlist && \
	node scripts/generatescriptjade > views/_scripts.jade

