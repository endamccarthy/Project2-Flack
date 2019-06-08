from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length


class UsernameForm(FlaskForm):
    username = StringField('Enter a Username', validators=[DataRequired(), Length(1, 30)])
    submit = SubmitField('Enter')

class ChannelNameForm(FlaskForm):
    channelName = StringField('Enter a Unique Channel Name', validators=[DataRequired(), Length(1, 50)])
    submit = SubmitField('Create')