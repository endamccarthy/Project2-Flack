from flask import Blueprint, render_template


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)


@main.route("/")
def index():
    return render_template("index.html")


@main.route("/contact")
def contact():
    return render_template("contact.html")

    