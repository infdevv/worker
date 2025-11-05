# We don't use JavaScript to test.

import requests 

def test_proxy(site, payload):

    request = requests.post("http://localhost:8080/stream/" + site, json=payload)

    print(request.text)

    print("Checked!")

if 1 == 1:
    
    test_proxy(

        "api.deepinfra.com/v1/chat/completions",
        
        {
            "model": "Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo",
            "messages": [
                {"content": "Where is france on Earth?", "role": "user"}
            ],
            "temperature": 0.7,
            "stream": True
        }
        
    )