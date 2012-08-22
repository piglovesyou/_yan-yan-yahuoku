COMPILER_ZIP					= compiler-latest.zip
COMPILER_REMOTE_DIR		= http://closure-compiler.googlecode.com/files/$(COMPILER_ZIP)
COMPILER_DIR					= closure-compiler/
COMPILER_JAR					= $(COMPILER_DIR)/compiler.jar
CLOSURELIB_DIR        = ./public/closure-library
CLOSURELIB_REMOTE_DIR = http://closure-library.googlecode.com/svn/trunk/
DUMMY_CLIENTSCRIPT_PATH    = public/javascripts/app.js


COMMAND_CLOSURE_BUILDER_ = $(CLOSURELIB_DIR)/closure/bin/build/closurebuilder.py \
	--root=$(CLOSURELIB_DIR) \
	--root=public/closure-thirdparty/closure-scroller/piglovesyou \
	--root=public/closure-thirdparty/closure-thousandrows/piglovesyou \
	--root=public/my \
	--root=public/javascripts \
	--namespace="main" \
	--compiler_jar=$(COMPILER_JAR) \
	--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
	--compiler_flags="--warning_level=VERBOSE"


setup:;
	rm -rf $(COMPILER_DIR) && \
	wget -P $(COMPILER_DIR) $(COMPILER_REMOTE_DIR) && \
	unzip -d $(COMPILER_DIR) $(COMPILER_DIR)$(COMPILER_ZIP) && \
	rm $(COMPILER_DIR)$(COMPILER_ZIP) && \
	rm -rf $(CLOSURELIB_DIR) && \
	svn checkout $(CLOSURELIB_REMOTE_DIR) $(CLOSURELIB_DIR)

compile:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=compiled \
	> public/javascripts/main-min.js

calcdeps:;
	$(COMMAND_CLOSURE_BUILDER_) \
	--output_mode=list \
	> scripts/scriptlist && \
	node scripts/generatescriptjade > views/_scripts.jade

