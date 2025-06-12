const volunteeringModel = require('../models/volunteering-model');

//load and show page with data
async function renderVolunteeringPage(req, res) {
    if (!res.locals.loggedIn) return res.redirect('/users/login');

    const userId = req.session.user.UserID;
    const rawSearch = req.query.search || '';
    const searchTerm = rawSearch.toLowerCase();
    const filterOption = req.query.filter || 'Default';
    const viewFilter = req.query.view || 'all';
    const language = res.locals.language;
    const volunteering = require(`../json/${language}/volunteering.json`);

    try {
        let events = await volunteeringModel.getAllVolunteerEvents(userId);

        //if search term provided- filter events by title/description
        if (searchTerm) {
            events = events.filter(event =>
                event.Title.toLowerCase().includes(searchTerm) ||
                event.Description.toLowerCase().includes(searchTerm)
            );
        }

        //filter view: joined, unjoined, or all
        if (viewFilter === 'joined') {
            events = events.filter(e => e.joined);
        } else if (viewFilter === 'unjoined') {
            events = events.filter(e => !e.joined);
        }

        //sorting events by selected filter option
        if (filterOption === 'StartDate') {
            events.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        } else if (filterOption === 'Location') {
            events.sort((a, b) => a.Location.localeCompare(b.Location));
        } else if (filterOption === 'Points') {
            events.sort((a, b) => b.Points - a.Points);
        }

        //for events created by current user- retrieve list of applicants and store in dictionary 
        const applicantMap = {};
        for (const event of events) {
            if (event.CreatorID === userId) {
                const applicants = await volunteeringModel.getApplicantsForPost(event.PostID);
                applicantMap[event.PostID] = applicants;
            }
        }

        res.render('../src/views/pages/volunteering', {
            volunteering,
            volunteeringEvents: events,
            searchTerm,
            filterOption,
            viewFilter,
            user: req.session.user,
            applicantMap 
        });

    } catch (err) {
        console.error('Error loading volunteering page:', err);
        res.status(500).send('Internal Server Error');
    }
}

//pass user and post ID to join event 
async function handleJoinEvent(req, res) {
    if (!res.locals.loggedIn) return res.redirect('/users/login');
    const userId = req.session.user.UserID;
    const postId = parseInt(req.params.id);
    try {
        await volunteeringModel.joinVolunteerEvent(userId, postId);
        res.redirect('/volunteering');
    } catch (err) {
        console.error('Error joining volunteer event:', err);
        res.status(500).send('Internal Server Error');
    }
}

//retrieve form details from POST req and pass data to create event
async function handleCreate(req, res) {
    const { title, description, location, startDate, applyBy, points } = req.body;
    const userId = req.session.user.UserID;
    try {
        await volunteeringModel.createVolunteerEvent({
            userId,
            title,
            description,
            location,
            startDate,
            applyBy,
            points: parseInt(points)
        });
        res.redirect('/volunteering');
    } catch (err) {
        console.error('Error creating volunteer event:', err);
        res.status(500).send('Internal Server Error');
    }
}

//pass user and post ID to unjoin event
async function handleUnjoinEvent(req, res) {
    if (!res.locals.loggedIn) return res.redirect('/users/login');
    const userId = req.session.user.UserID;
    const postId = parseInt(req.params.id);
    try {
        await volunteeringModel.unjoinVolunteerEvent(userId, postId);
        res.redirect('/volunteering');
    } catch (err) {
        console.error('Error unjoining volunteer event:', err);
        res.status(500).send('Internal Server Error');
    }
}

//check current user ID and only allow creator of post to delete
async function handleDeleteEvent(req, res) {
    const postId = parseInt(req.params.id);
    const userId = req.session.user.UserID;

    try {
        const post = await volunteeringModel.getVolunteerPost(postId);
        if (post.UserID !== userId) return res.status(403).send('Forbidden');

        await volunteeringModel.deleteVolunteerEvent(postId);
        res.redirect('/volunteering');
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    renderVolunteeringPage,
    handleJoinEvent,
    handleUnjoinEvent,
    handleCreate,
    handleDeleteEvent,
};
