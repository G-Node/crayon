JS_COMPILER = uglifyjs

COMPILATION_UNIT = src/start.js \
									 src/core/core.js \
									 src/core/version.js \
								   src/end.js \
								   src/domReadyStart.js \
									 src/core/clear.js \
									 src/core/color.js \
									 src/grid/grid.js \
									 src/plot/drawsignal.js \
									 src/plot/drawdensity.js \
									 src/plot/drawspiketrain.js \
									 src/event/drag.js \
								 	 src/domReadyEnd.js

all: crayon.js crayon.css

crayon.js: $(COMPILATION_UNIT)
	cat $(COMPILATION_UNIT) > crayon.js

crayon.css: src/crayon.css
	cp src/crayon.css crayon.css

crayon.min.js: crayon.js
	$(JS_COMPILER) < crayon.js > crayon.min.js

.PHONY: clean
clean:
	rm -rf crayon*.js
