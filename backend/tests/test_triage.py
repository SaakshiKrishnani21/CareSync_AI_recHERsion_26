"""Scripted triage scenarios. The safety goal: every emergency below MUST be flagged (sensitivity 100%)."""
import pytest
from triage import RANK, rules

def level(**i):
    hits = rules({"intake": {"symptoms": "", "severity": 3, **i}})["hits"]
    return max([h["level"] for h in hits], key=RANK.get, default="routine")

EMERGENCIES = [
    dict(symptoms="severe chest pain spreading to my left arm"), dict(symptoms="I have pressure in chest and sweating"), dict(symptoms="सीने में दर्द और पसीना"),
    dict(symptoms="छातीत दुखत आहे"), dict(symptoms="seene mein dard hai"), dict(symptoms="I can't breathe properly"), dict(symptoms="सांस लेने में तकलीफ है"),
    dict(symptoms="श्वास घेण्यास त्रास होतोय"), dict(symptoms="my father has slurred speech and face drooping"), dict(symptoms="चेहरा टेढ़ा हो गया है"), dict(symptoms="he fainted and is not responding"),
    dict(symptoms="बेहोश हो गया"), dict(symptoms="she had a seizure"), dict(symptoms="my throat swelling after eating peanuts"), dict(symptoms="vomiting blood since morning"),
    dict(symptoms="I want to die"), dict(symptoms="मुझे आत्महत्या के विचार आ रहे हैं"), dict(symptoms="some bleeding", pregnant=True), dict(symptoms="रक्तस्राव सुरू आहे", pregnant=True),
    dict(symptoms="baby not moving since yesterday", pregnant=True), dict(symptoms="बच्चा हिल नहीं रहा", pregnant=True),
    dict(symptoms="feeling odd", screen=["chest"]), dict(symptoms="feeling odd", screen=["stroke"]), dict(symptoms="feeling odd", screen=["bloodvomit"]), dict(symptoms="tired", spo2="88"),
]
@pytest.mark.parametrize("case", EMERGENCIES)
def test_emergency_is_flagged(case): assert level(**case) == "emergency", case

URGENT = [dict(symptoms="severe headache and blurred vision", pregnant=True), dict(symptoms="stiff neck and fever"), dict(symptoms="pain", severity=9),
          dict(symptoms="fever", temp="104"), dict(symptoms="dizzy", bp_sys="195", bp_dia="110"), dict(symptoms="fever", age=0, symptom_list=["fever"]), dict(symptoms="tired", pulse="150")]
@pytest.mark.parametrize("case", URGENT)
def test_urgent_is_flagged(case): assert RANK[level(**case)] >= RANK["urgent"], case

ROUTINE = [dict(symptoms="mild headache for a day"), dict(symptoms="runny nose and sneezing"), dict(symptoms="knee pain after jogging"), dict(symptoms="skin itching", temp="36.8", spo2="98", bp_sys="120", pulse="76"),
           dict(symptoms="some bleeding", pregnant=False)]
@pytest.mark.parametrize("case", ROUTINE)
def test_routine_not_over_triaged(case): assert level(**case) == "routine", case

def test_fahrenheit_is_converted(): assert level(symptoms="x", temp="101") == "routine"
