# js compiler
JSC = uglifyjs --no-copyright --no-mangle --no-squeeze --lift-vars
# CSS compiler
CSSC = lessc

# output
OUT_DIR     = static
OUT_DIR_JS  = $(OUT_DIR)
OUT_DIR_CSS = $(OUT_DIR)
OUT_NAME    = crayon


# sources
JS_SRC_MAIN  = $(wildcard src/*.js)
CSS_SRC_MAIN = $(wildcard src/*.less)

JS_SRC  = $(wildcard src/cry/*.js)
CSS_SRC = $(wildcard src/cry/*.less)

JS_SRC_EXTRA = 

all: clean extra static/crayon.js static/crayon-min.js static/crayon.less static/crayon.css

$(OUT_DIR_JS)/$(OUT_NAME).js: $(JS_SRC_MAIN) $(JS_SRC)
		cat $(JS_SRC_MAIN) $(JS_SRC) > $(OUT_DIR_JS)/$(OUT_NAME).js

$(OUT_DIR_JS)/$(OUT_NAME)-min.js: static/crayon.js
		$(JSC) $(OUT_DIR_JS)/$(OUT_NAME).js > $(OUT_DIR_JS)/$(OUT_NAME)-min.js

$(OUT_DIR_CSS)/$(OUT_NAME).less: $(CSS_SRC_MAIN) $(CSS_SRC)
		cat $(CSS_SRC_MAIN) $(CSS_SRC) > $(OUT_DIR_CSS)/$(OUT_NAME).less

$(OUT_DIR_CSS)/$(OUT_NAME).css: $(OUT_DIR_CSS)/$(OUT_NAME).less
		$(CSSC) $(OUT_DIR_CSS)/$(OUT_NAME).less > $(OUT_DIR_CSS)/$(OUT_NAME).css

.PHONY: extra
extra:
		for i in $(JS_SRC_EXTRA); do $(JSC) $$i > $(OUT_DIR_JS)/`basename $$i` ; done

.PHONY: clean
clean:
		rm -rf $(OUT_DIR_JS)/$(OUT_NAME)*
		for i in $(JS_SRC_EXTRA); do rm -rf $(OUT_DIR_JS)/`basename $$i` ; done
