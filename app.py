from flask import Flask, render_template, request, jsonify
from tinydb import TinyDB, Query
import time
import uuid
from chat_handler import get_answer

app = Flask(__name__)

db = TinyDB('db.json')
conversations = db.table('conversations')

@app.route('/')
def index():
    conversations_list = conversations.all()
    return render_template('index.html', conversations=[conv["conversation_id"] for conv in conversations_list])

@app.route('/send_message', methods=["POST"])
def send_message():
    message = request.form.get('message', '').strip()
    conversation_id = request.form.get('conversation_id', '').strip()
    conversation = conversations.get(Query().conversation_id == conversation_id)

    messages = conversation.get('messages', [{"role": "system", "content": "You are a helpful assistant."}])
    messages.append({"role": "user", "content": message})
    new_response = get_answer(messages)
    messages.append(new_response)
    conversations.update({'messages': messages}, Query().conversation_id == conversation_id)
    return jsonify({'conversation_id': conversation_id, "title": conversation.get("title", "New Conversation")})

@app.route("/make_new_conversation")
def make_new_conversation():
    conversation = {
        'conversation_id': str(uuid.uuid4()),
        "created": time.time(),
        "title": "New Conversation",
        'messages': []
        }
    conversations.insert(conversation)
    return jsonify({key: conversation[key] for key in ["conversation_id", "title"]})

@app.route('/get_messages')
def get_messages():
    conversation_id = request.args.get('conversation_id', '').strip()
    if conversation_id:
        conversation = conversations.get(Query().conversation_id == conversation_id)
        return jsonify(conversation)
    else:
        return jsonify({})

@app.route('/get_conversations')
def get_conversations():
    conversations_list = [{"conversation_id": conv["conversation_id"], "created": conv["created"], "title": conv["title"]} for conv in conversations.all()]
    conversations_list.sort(key=lambda x: x["created"])
    return jsonify(conversations_list)

if __name__ == '__main__':
    app.run(debug=True)
