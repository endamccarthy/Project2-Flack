from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length


class UsernameForm(FlaskForm):
    username = StringField('Enter a Username', validators=[DataRequired(), Length(1, 30)])
    submit = SubmitField('Enter')