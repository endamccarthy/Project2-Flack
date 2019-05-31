from flask import Blueprint, render_template
from core.main.forms import UsernameForm


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)


@main.route("/", methods=['GET', 'POST'])
def index():
    form = UsernameForm()
    if form.validate_on_submit():
        return render_template("index.html", title="test", form=form)
        
    return render_template("index.html", title="Home", form=form)


@main.route("/contact")
def contact():
    return render_template("contact.html")

    