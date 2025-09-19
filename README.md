# shellhacks
resources &amp; others

# warning 
- since we'll probably be adding lots of diff templates, frameworks, libs: 
- recommend:
  -  create a new sub-dir for each respective (new) project to server as testing grounds
  -  avoid dependency hell  
  -  using [bun runtime & js toolkit](https://bun.com)
     - npm, pnpm, yarn trash 
     - reduce "works on my machine" errors 

# foreword 
- run ```bun init``` when instantiating a __new__ project in a new dir 
    - no need to do if pulling an existing one (already been done) 
    - this is just so bun runtime recognizes the __package.json__  

- use [UV](https://github.com/astral-sh/uv) 
    - 100x better than pip in terms of py dep management 
    - 100x faster
    - creating venv's works out the box 
    
