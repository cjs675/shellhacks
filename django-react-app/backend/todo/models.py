from django.db import models 

# Create your models here.
# after making any changes 
class Todo(models.Model):
           title=models.CharField(max_length=150)
           description=models.CharField(max_length=500)
           completed=models.BooleanField(default=False)

def __str__(self):
    # returns title 
  
    return  self.title  

