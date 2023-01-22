.PHONY: deploy
deploy:
	make html && rsync -avz build/html/ root@65.109.190.148:/var/www/html/crawler

.PHONY: html
html:
	sphinx-multiversion source build/html

.PHONY: serve
serve:
	python3 -m http.server -d build/html
