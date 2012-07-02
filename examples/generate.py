# Various functions that could be used to generate random signals,
# spiketrains etc

# Usage : 
# python -i generate.py 
# >>> spiketrain(0, 1500)

from random import randint

def spiketrain(start, stop, step = 15):
  t = start

  while ( t < stop ) :
    delta = randint(2, step);

    t += delta 

    print "%d," %(t)
    

def signal(start, stop, ymin, ymax, step = 15):
  t = start

  while ( t < stop ):
    t += step
    y = randint(ymin, ymax)

    print "{x: %d, y: %d}," %(t, y)



