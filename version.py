#! /usr/bin/env python

# Script to automatically update version number in particular file
# with particular template.

FILE     = 'src/core/version.js'
REGEXP   = r'version.\=.\'(\d+)\.(\d+)\.(\d+)\';'
TEMPLATE = "crayon.version = '%d.%d.%d';"

if __name__ == '__main__':
  import re 
  import sys

  fd = open(FILE)
  v  = fd.read()
  fd.close()

  m  = re.search(REGEXP, v)

  major = int(m.group(1))
  minor = int(m.group(2))
  patch = int(m.group(3))

  if (len(sys.argv) != 3) :
    print "Not enough argmuments"
    sys.exit()

  if   (sys.argv[1] == 'increment'):
    inc = 1
  elif (sys.argv[1] == 'decrement'):
    inc = -1

  if   (sys.argv[2] == 'major'):
    major += inc
    minor = 0
    patch = 0
  elif (sys.argv[2] == 'minor'):
    minor += inc
    patch = 0
  elif (sys.argv[2] == 'patch'):
    patch += inc
  
  fd = open(FILE, 'w')
  fd.write(TEMPLATE %(major, minor, patch))
  fd.close()

  print "Version number bumped upto " + TEMPLATE %(major, minor, patch)
