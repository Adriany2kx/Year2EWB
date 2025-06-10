const volunteeringModel = require('../models/volunteering-model');

async function renderVolunteeringPage(req, res) {
    if (!res.locals.loggedIn) return res.redirect('/users/login');

    const userId = req.session.user.UserID;
    const rawSearch = req.query.search || '';
    const searchTerm = rawSearch.toLowerCase();
    const filterOption = req.query.filter || 'Default';
    const viewFilter = req.query.view || 'all';

    try {
        let events = await volunteeringModel.getAllVolunteerEvents(userId);

        if (searchTerm) {
            events = events.filter(event =>
                event.Title.toLowerCase().includes(searchTerm) ||
                event.Description.toLowerCase().includes(searchTerm)
            );
        }

        if (viewFilter === 'joined') {
            events = events.filter(e => e.joined);
        } else if (viewFilter === 'unjoined') {
            events = events.filter(e => !e.joined);
        }

        if (filterOption === 'StartDate') {
            events.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        } else if (filterOption === 'Location') {
            events.sort((a, b) => a.Location.localeCompare(b.Location));
        } else if (filterOption === 'Points') {
            events.sort((a, b) => b.Points - a.Points);
        }

        const applicantMap = {};
        for (const event of events) {
            if (event.CreatorID === userId) {
                const applicants = await volunteeringModel.getApplicantsForPost(event.PostID);
                applicantMap[event.PostID] = applicants;
            }
        }

        res.render('../src/views/pages/volunteering', {
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

async function viewApplicants(req, res) {
    const postId = parseInt(req.params.id);
    try {
        const applicants = await volunteeringModel.getApplicantsForPost(postId);
        res.render('../src/views/pages/view-applicants', { applicants });
    } catch (err) {
        console.error('Error fetching applicants:', err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    renderVolunteeringPage,
    handleJoinEvent,
    handleUnjoinEvent,
    handleCreate,
    handleDeleteEvent,
    viewApplicants
};
