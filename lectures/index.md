---
layout: default
permalink: /lectures/
---

<div class="week hrow">
    <div class="week_id">Week</div>
    <div class="date">Date</div>
	<div class="topic">Lecture</div>
    <div class="notes">Slides</div>
    <div class="readings">Readings</div>
</div>

{% assign week_id = 1 %}
{% for e in site.data.lectures %}
<div class="week {% cycle "odd", "even" %}">
    {% if e.break %}
        <div class="week_id"></div>
        <div class="date"></div>
        <div class="topic">{{e.break}}</div>
    {% else %}
        <div class="week_id">{{week_id}}</div>
        {% assign week_id = week_id | plus: 1 %}
        <div class="date"></div>
    	{% if e.link %}
        <div class="topic"><a href="{{e.link}}">{{e.week}}</a></div>
        {% else %}
        <div class="topic">{{e.week}}</div>
        {% endif %}
        <div class="notes">
            <ul>
            {% for note in e.notes %}
                <li><a href="{{note[1]}}">{{note[0]}}</a></li>
			{% endfor %}
            </ul>
        </div>
        <div class="readings">
            <ul>
            {% for reading in e.readings %}
                    <li><a href="{{reading[1]}}">{{reading[0]}}</a></li>
			{% endfor %}
            </ul>
        </div>
    {% endif %}
    
</div>
{% endfor %}

<script type="text/javascript">
   make_schedule({{site.data.settings.first}},7,1);
</script>
