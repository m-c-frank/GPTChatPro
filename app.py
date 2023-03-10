from flask import Flask, render_template, request, jsonify
from tinydb import TinyDB, Query
import time
import uuid
from chat_handler import get_answer

app = Flask(__name__)

db = TinyDB('db.json')

@app.route('/')
def index():
    conversations_list = db.table('conversations').all()
    return render_template('index.html', conversations=[conv["conversation_id"] for conv in conversations_list])

@app.route('/send_message', methods=["POST"])
def send_message():
    message = request.json['message']
    conversation_id = request.json['conversation_id']

    conversations = db.table('conversations')
    conversation = conversations.get(Query().conversation_id == conversation_id)

    messages = conversation.get('messages', [{"role": "system", "content": "You are a helpful assistant."}])
    messages.append({"role": "user", "content": message})
    new_response = get_answer(messages)
    messages.append(new_response)
    db.table('conversations').update({'messages': messages}, Query().conversation_id == conversation_id)
    return jsonify(new_response), 200

@app.route("/make_new_conversation")
def make_new_conversation():
    conversation = {
        'conversation_id': str(uuid.uuid4()),
        "created": time.time(),
        "title": "New Conversation",
        'messages': []
        }
    db.table('conversations').insert(conversation)
    return jsonify({key: conversation[key] for key in ["conversation_id", "title"]}),200

@app.route('/delete_all_conversations', methods=["POST"])
def delete_all_conversations():
    db.drop_table('conversations')
    return '', 204

@app.route('/get_messages')
def get_messages():
    conversation_id = request.args.get('conversation_id', '').strip()
    if conversation_id:
        conversation = db.table('conversations').get(Query().conversation_id == conversation_id)
        return jsonify(conversation)
    else:
        return jsonify({})

@app.route('/update_title')
def update_title():
    conversation_id = request.args.get('conversation_id', '').strip()
    new_title = request.args.get('title', '').strip()
    print(conversation_id, new_title)
    if conversation_id and new_title:
        #update the title for the correct conversation
        conversation = db.table('conversations').get(Query().conversation_id == conversation_id)
        if conversation:
            conversation['title'] = new_title
            db.table('conversations').update(conversation, Query().conversation_id == conversation_id)
            return jsonify({key: conversation[key] for key in ["conversation_id", "title"]}), 200
    return jsonify({}), 400


@app.route('/get_conversations')
def get_conversations():
    convs = db.table('conversations').all()
    print(convs)
    if not convs:
        return jsonify([])
    conversations_list = [{"conversation_id": conv["conversation_id"], "created": conv["created"], "title": conv["title"]} for conv in convs]
    conversations_list.sort(key=lambda x: x["created"])
    return jsonify(conversations_list)

if __name__ == '__main__':
    app.run(debug=True)
