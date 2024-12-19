---
layout: home
---

## Prerequisite

This course requires a good understanding of web development (CSCC09 recommended).

## Course Staff

We encourage you to post questions regarding course materials and projects on Element. However, if you need extended support, the course staff will hold office hours.

<div class="grid">
    <div class="hrow row">
        <div class="hcolumn column3"></div>
        <div class="column3">Office Hours</div>
        <div class="column3">Location</div>
        <div class="column3">Contact</div>
    </div>
    <div class="row">
        <div class="hcolumn column3">Thierry Sans</div>
        <div class="column3">{{site.data.settings.instructor.hours}}</div>
        <div class="column3">{{site.data.settings.instructor.location}}</div>
        <div class="column3">{{site.data.settings.instructor.contact}}</div>
    </div>
    <!--div class="row">
        <div class="hcolumn column3">David Liu</div>
        <div class="column3">TBD</div>
        <div class="column3"></div>
        <div class="column3">Element only (no email)</div>
    </div-->
    {% for a in site.data.settings.assistants %}
    <div class="row">
        <div class="hcolumn column3">{{a.name}}</div>
        <div class="column3">{{a.hours}}</div>
        <div class="column3">{{a.location}}</div>
        <div class="column3">Element only (no email)</div>
    </div>
    {% endfor %}
</div>

## Course Timing

<div class="grid">
    <div class="hrow row">
        <div class="hcolumn column3"></div>
        <div class="column3">Time</div>
        <div class="column3">Location</div>
    </div>
    {% for t in site.data.settings.timings %}
    <div class="row">
        <div class="hcolumn column3">{{t.section}}</div>
        <div class="column3">{{t.time}}</div>
        <div class="column3">{{t.location}}</div>
    </div>
    {% endfor %}
</div>

## Course Information

- The [course website]({{site.data.settings.website}}) and its [Github repository]({{site.data.settings.github}})

	One of the nice things about using Github for the course website is that you can contribute to the course website. If you see something on the course website that should be fixed, or want to improve the UI, please feel free to submit a pull request. 

- [The Element Discussion Board]({{ site.data.settings.element }})

	The discussion board is the best place to ask technical questions, and general questions about the course, projects and labs. For personal issues, please use instructor's private channel. I try to respond by the end of the next day. However, due to volume, it may take longer, especially on weekends.

## Marking Scheme

The numeric marks of the projects and final exam will be used to compute a composite numeric score that will determine your final letter grade for the course. The weighting of course work is set as:

<div class="grid">
    <div class="hrow row">
        <div class="hcolumn column4"></div>
        <div class="column4">Weight</div>
    </div>
    <div class="row">
        <div class="hcolumn column4">Assignments</div>
        <div class="column4">30% (2 assignments, 15% each)</div>
    </div>
    <div class="row">
        <div class="hcolumn column4">Research and Project</div>
        <div class="column4">40%</div>
    </div>
    <div class="row">
        <div class="hcolumn column4">Participation</div>
        <div class="column4">5%</div>
    </div>
    <div class="row">
        <div class="hcolumn column4">Final Exam</div>
        <div class="column4">25%</div>
    </div>
</div>

## Submission and Grading Policy

For each assignments and project, the student or the team will be required to submit the source code on the Github repository through Github classroom. 

The instructor reserves the right to assign different grades to each of the team members based on their individual contributions made to Github repository. 

For your work to be graded, it must meet the minimum standards of a professional computer scientist. **All** files required to build the program must be committed to the repository, and the program must work. Last minute difficulties with git can easily be avoided by ensuring all files are added to the repository well before the deadline, and that you know how to commit them. **Your submission may receive a grade of 0, if the code does not compile or does not execute properly.**

No late allowed. 

If an emergency arises that prevents you from being able to complete any piece of work, or attend an exam, contact one of the instructors immediately. 

If a piece of work has been mis-marked or if you believe the rubric used to evaluate the work is not appropriate, you may request a re-mark. For a re-mark to succeed, you must clearly and concisely express what you believe was mis-marked. To request a re-mark, please contact your TA. Requests must be submitted *within 1 week* of the marks being returned.

## Academic Integrity

You are expected to comply with the [Code of Behaviour on Academic Matters](http://www.governingcouncil.utoronto.ca/Assets/Governing+Council+Digital+Assets/Policies/PDF/ppjun011995.pdf). 

You are not allowed to look at solutions available online. 

You are fully responsible for the piece of work you submit as your contribution to the project. 

When the assignment handout allows you to use snippets of code from the web, you should cite the source in the source code. As a rule of thumb, any piece of code larger than 5 lines that has been copied and re-used as is or even slightly modified must be clearly referenced. However, any piece of code larger than 25 lines should not be re-used. 

You may discuss projects with other students, for example to clarify the requirements of an project, to work through examples that help you understand the technology used for an project, or to learn how to configure your system to run a supporting piece of software used in an project. However, collaboration at the level of answering written questions or designing and writing code, is strictly forbidden. Written problems and programming projects must be answered, designed and coded by you alone, using the text, your own notes, and other texts and Web sources as aids.

Do not let other students look at your project solutions, since this can lead to copying. Remember you are in violation of the UTSC Academic Code whether you copy someone else's work or allow someone else to copy your work. These rules are meant to ensure that all students understand their solutions well enough to prepare the solutions themselves. If challenged you must be able to reproduce and explain your work.

You are not allowed to ask for help outside of the course Element. Asking for help anywhere else online or in private chat groups (unless the private group chat was setup between the group members of the group project) will be considered as unauthorized help. 

The course staff reserves the right to use code and text analysis tools to compare your submission with others to verify that no improper collaboration has occurred.

Failure to comply with these guidelines is a serious academic offence. In past academic offense cases, the Associate Dean has imposed penalties for code violations that range from a mark of zero on plagiarized projects to academic suspension from the University.


## Accessibility Needs

The University of Toronto is committed to accessibility. If you require accommodations for a disability, or have any accessibility concerns about the course, the classroom or course materials, please contact Accessibility Services as soon as possible: <https://www.utsc.utoronto.ca/ability/welcome-accessability-services>
