# python django social media framework from https://github.com/shravanngoswamii/social-media-feed-django

"""has all features of social media app signup/login, post, like, comment, search for users, manage profile
very basic, not that attractive, but could be used for 
picking and choosing whats useful to us (if anything)
am rather sleepy will read more into it in the morning

TECH STACK
Backend - django
Database - SQLite - can be configd for Postgre / MySQL
Frontent - html/css, javascript, django templates
Setup reqs - python3..., pip, venv, django and dependencies"""

### structure
organization
social-media-feed-django/
├── social_media/          # Main Django project
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── feed/                  # Main app
│   ├── models.py         # User, Post, Comment models
│   ├── views.py          # View functions
│   ├── urls.py           # URL patterns
│   └── templates/        # HTML templates
├── static/               # CSS, JS, images
├── manage.py
└── requirements.txt

# user model (django)
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)

post model (django)
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    
    class Meta:
        ordering = ['-created_at']

# views (django)
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

@login_required
def feed(request):
    posts = Post.objects.all()
    return render(request, 'feed.html', {'posts': posts})

### model

## writing logic in views.py
# core/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Post, Comment, Like
from .forms import PostForm, CommentForm, UsernameChangeForm
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from django.db.models import Q

# Signup View
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('feed')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

# Login View 
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('feed')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

# Logout View 
@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

# View for Logged In User Feed and Logged Out User Feed
def feed(request):
    posts = Post.objects.all().order_by('-created_at')
    if request.user.is_authenticated:
        return render(request, 'feed.html', {'posts': posts})
    else:
        return render(request, 'guest_feed.html', {'posts': posts})
    
# View for Creating a Post
@login_required
def post_create(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            return redirect('feed')
    else:
        form = PostForm()
    return render(request, 'post_create.html', {'form': form})

# View for Deleting a Post
@login_required
def post_delete(request, pk):
    post = get_object_or_404(Post, pk=pk, user=request.user)
    post.delete()
    return redirect('feed')

# View for Commenting on a Post
@login_required
def comment_create(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.user = request.user
            comment.post = post
            comment.save()
            return redirect('feed')
    else:
        form = CommentForm()
    return render(request, 'comment_create.html', {'form': form, 'post': post})

# View for Deleting a Comment
@login_required
def comment_delete(request, pk):
    comment = get_object_or_404(Comment, pk=pk, user=request.user)
    comment.delete()
    return redirect('feed')

# View for Liking a Post
@login_required
def like(request, pk):
    post = get_object_or_404(Post, pk=pk)
    like_obj, created = Like.objects.get_or_create(user=request.user, post=post)
    if not created:
        like_obj.delete()
    like_count = Like.objects.filter(post=post).count()
    return redirect('feed')

# View for showing a user's profile
def user_profile(request, username):
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(user=user)
    likes = Like.objects.filter(user=user)
    context = {
        'profile_user': user,
        'posts': posts,
        'likes': likes,
    }
    return render(request, 'user_profile.html', context)

# View for showing a other user's profile for logged out users
def guest_profile(request, username):
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(user=user)
    return render(request, 'guest_profile.html', {'profile_user': user, 'posts': posts})

# View for changing a user's username
@login_required
def change_username(request):
    if request.method == 'POST':
        form = UsernameChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Update session to keep user logged in
            messages.success(request, 'Your username has been updated.')
            return redirect('user_profile', user.username)
    else:
        form = UsernameChangeForm(instance=request.user)
    return render(request, 'change_username.html', {'form': form})

# View for searching users
def search_users(request):
    query = request.GET.get('q', '')
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    )
    return render(request, 'search_users.html', {'users': users, 'query': query})

## writing urls.py 

# core/urls.py

from django.urls import path, re_path
from . import views

from django.shortcuts import redirect

def redirect_to_feed(request):
    return redirect('feed')

urlpatterns = [
    # Redirecting to Home Page to Feed Page
    path('', redirect_to_feed),
    # Signup Page
    path('signup/', views.signup, name='signup'),
    # Login
    path('login/', views.login_view, name='login'),
    # Logout
    path('logout/', views.logout_view, name='logout'),
    # Feed Page
    path('feed/', views.feed, name='feed'),
    # Post Create
    path('post/create/', views.post_create, name='post_create'),
    # Post Delete
    path('post/<int:pk>/delete/', views.post_delete, name='post_delete'),
    # Comment on Posts
    path('post/<int:pk>/comment/', views.comment_create, name='comment_create'),
    # Delete Comment
    path('comment/<int:pk>/delete/', views.comment_delete, name='comment_delete'),
    # Like Post
    path('post/<int:pk>/like/', views.like, name='like'),
    # Redirecting to Latest Username
    re_path(r'^profile/(?!change-username/)(?P<username>\w+)/$', views.user_profile, name='user_profile'),
    # For fetching user the username on posts
    path('guest/profile/<str:username>/', views.guest_profile, name='guest_profile'),
    # Change Username
    path('profile/change-username/', views.change_username, name='change_username'),
    # Search Users
    path('search/', views.search_users, name='search_users'),
]

## writing models

# core/models.py

from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.content[:20]}..."

class Comment(models.Model):
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.content[:20]}..."

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')

    def __str__(self):
        return f"{self.user.username} liked {self.post.content[:20]}..."

## writing forms.py

# core/forms.py

from django import forms
from .models import Post, Comment
from django.contrib.auth.models import User

class UsernameChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content']

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']

## creating html temps

{% load bootstrap5 %}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Social Media Feed</title>
    {% bootstrap_css %}
    {% load static %}
    {% comment %}Add this Style page if you are doing any custom styling{% endcomment %}
    {% comment %} <link rel="stylesheet" href="{% static 'css/styles.css' %}" /> {% endcomment %}
  </head>
  <body>
    {% bootstrap_messages %}
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" href="{% url 'feed' %}">Social Media Feed</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              {% if user.is_authenticated %}
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'feed' %}">Feed</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'post_create' %}">New Post</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'logout' %}">Logout</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'user_profile' user.username %}">Profile</a>
                </li>
              {% else %}
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'login' %}">Login</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="{% url 'signup' %}">Sign Up</a>
                </li>
              {% endif %}
            </ul>
          </div>
          <form class="d-flex" role="search" action="{% url 'search_users' %}">
            <input class="form-control me-2" type="search" placeholder="Search Users" aria-label="Search" name="q" />
            <button class="btn btn-outline-light" type="submit">Search</button>
          </form>
        </div>
      </nav>
    </header>
    <main class="container my-4">
      {% block content %}

      {% endblock %}
    </main>
    {% bootstrap_javascript %}
  </body>
</html>

## core/templates/signup.html

{% extends 'base.html' %}
{% load bootstrap5 %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Sign Up</h2>
          <form method="post">
            {% csrf_token %}
            {% bootstrap_form form %}
            <p>Already have an account? <a href="{% url 'login' %}">Login</a></p>
            <button type="submit" class="btn btn-primary">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

## core/templates/login.html

{% extends 'base.html' %}
{% load bootstrap5 %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Login</h2>
          <form method="post">
            {% csrf_token %}
            {% bootstrap_form form %}
            <p>Don't have an account? <a href="{% url 'signup' %}">Signup</a></p>
            <button type="submit" class="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

## core/templates/feed.html

{% extends 'base.html' %}

{% block content %}
  <h2>Feed</h2>
  {% for post in posts %}
    <div class="card mb-3">
      <div class="card-body">
        <p class="card-text">{{ post.content }}</p>
        <p class="card-text">Posted by: {{ post.user.username }} on {{ post.created_at }}</p>
        {% comment %} <p class="card-text">Likes: {{ post.likes.count }}</p> {% endcomment %}
        <div class="d-flex justify-content-between">
          <div>
            <a href="{% url 'comment_create' post.pk %}" class="btn btn-primary btn-sm">Add Comment</a>
            <a href="{% url 'like' post.pk %}" class="btn btn-secondary btn-sm">Like {{ post.likes.count }}</a>
          </div>
          {% if post.user == request.user %}
            <a href="{% url 'post_delete' post.pk %}" class="btn btn-danger btn-sm">Delete</a>
          {% endif %}
        </div>
      </div>
      {% if post.comments.exists %}
        <div class="card-footer">
          <h5>Comments</h5>
          {% for comment in post.comments.all %}
            <div class="card mb-2">
              <div class="card-body">
                <p class="card-text">{{ comment.content }}</p>
                <p class="card-text">Posted by: {{ comment.user.username }} on {{ comment.created_at }}</p>
                {% if comment.user == request.user %}
                  <a href="{% url 'comment_delete' comment.pk %}" class="btn btn-danger btn-sm">Delete</a>
                {% endif %}
              </div>
            </div>
          {% endfor %}
        </div>
      {% endif %}
    </div>
  {% endfor %}
{% endblock %}

## core/templates/guest_feed.html

{% extends 'base.html' %}

{% block content %}
  <h2>Feed</h2>
  {% for post in posts %}
    <div class="card mb-3">
      <div class="card-body">
        <p class="card-text">{{ post.content }}</p>
        <p class="card-text">
          Posted by: <a href="{% url 'guest_profile' post.user.username %}">{{ post.user.username }}</a> on {{ post.created_at }}
        </p>
        <p class="card-text">Likes: {{ post.likes.count }}</p>
      </div>
      {% if post.comments.exists %}
        <div class="card-footer">
          <h5>Comments</h5>
          {% for comment in post.comments.all %}
            <div class="card mb-2">
              <div class="card-body">
                <p class="card-text">{{ comment.content }}</p>
                <p class="card-text">Posted by: {{ comment.user.username }} on {{ comment.created_at }}</p>
                {% if comment.user == request.user %}
                  <a href="{% url 'comment_delete' comment.pk %}" class="btn btn-danger btn-sm">Delete</a>
                {% endif %}
              </div>
            </div>
          {% endfor %}
        </div>
      {% endif %}
    </div>
  {% endfor %}
  <p>
    Please <a href="{% url 'login' %}">login</a> or <a href="{% url 'signup' %}">signup</a> to interact with posts.
  </p>
{% endblock %}

## core/templates/post_create.html

{% extends 'base.html' %}
{% load bootstrap5 %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">New Post</h2>
          <form method="post">
            {% csrf_token %}
            {% bootstrap_form form %}
            <button type="submit" class="btn btn-primary">Post</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

## core/templates/comment_create

{% extends 'base.html' %}
{% load bootstrap5 %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Add Comment</h2>
          <p class="card-text">{{ post.content }}</p>
          <form method="post">
            {% csrf_token %}
            {% bootstrap_form form %}
            <button type="submit" class="btn btn-primary">Comment</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

## core/templates/user_profile

{% extends 'base.html' %}

{% block content %}
  <div class="row">
    <div class="col-md-6">
      <h2>{{ profile_user.username }}'s Profile</h2>
      {% if request.user == profile_user %}
        <p>
          <a href="{% url 'change_username' %}">Change Username</a>
        </p>
      {% endif %}

      <h4>Posts</h4>
      {% for post in posts %}
        <div class="card mb-3">
          <div class="card-body">
            <p class="card-text">{{ post.content }}</p>
            <p class="card-text">Posted on {{ post.created_at }}</p>
          </div>
        </div>
        {% empty %}
        <p>No posts yet.</p>
      {% endfor %}
    </div>
    <div class="col-md-6">
      <h4>Liked Posts</h4>
      {% for like in likes %}
        <div class="card mb-3">
          <div class="card-body">
            <p class="card-text">{{ like.post.content }}</p>
            <p class="card-text">Posted by: {{ like.post.user.username }} on {{ like.post.created_at }}</p>
          </div>
        </div>
        {% empty %}
        <p>No liked posts yet.</p>
      {% endfor %}
    </div>
  </div>
{% endblock %}

## core/templates/guest_profile.html

{% extends 'base.html' %}

{% block content %}
<h2>{{ profile_user.username }}'s Profile</h2>
<p>Please <a href="{% url 'login' %}">log in</a> to view this user's profile.</p>
{% endblock %}

## core/templates/change_username.html

{% extends 'base.html' %}
{% load bootstrap5 %}

{% block content %}
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Change Username</h2>
          <form method="post">
            {% csrf_token %}
            {% bootstrap_form form %}
            <button type="submit" class="btn btn-primary">Change Username</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{% endblock %}

## core/templates/search_users.html

{% extends 'base.html' %}

{% block content %}
  <h2>Search Results for "{{ query }}"</h2>
  {% if users %}
    <ul>
      {% for user in users %}
        <li>
          <a href="{% url 'user_profile' user.username %}">{{ user.username }}</a>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No users found.</p>
  {% endif %}
{% endblock %}

## writing admin.py

# core/admin.py

from django.contrib import admin
from .models import Post, Comment, Like

# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)