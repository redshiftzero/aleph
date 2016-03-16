from flask import redirect
from flask_admin.contrib import sqla

from aleph.core import db, admin, url_for
from aleph import authz
from aleph.model import Role, Document, Source, Watchlist, Entity


class BaseModelView(sqla.ModelView):

    def is_accessible(self):
        return authz.is_admin()

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('ui'))


class RoleView(BaseModelView):
    column_list = ['name', 'email', 'type']


class DocumentView(BaseModelView):
    column_list = ['title', 'source', 'content_hash']


class SourceView(BaseModelView):
    column_list = ['label', 'category', 'foreign_id']
    column_filters = ['label', 'category']


class WatchlistView(BaseModelView):
    column_list = ['label', 'foreign_id']
    column_filters = ['label']


class EntityView(BaseModelView):
    column_list = ['name', 'foreign_id', 'watchlist']
    column_filters = ['name', 'watchlist']


admin.add_view(RoleView(Role, db.session, endpoint='role_admin'))
admin.add_view(DocumentView(Document, db.session, endpoint='document_admin'))
admin.add_view(SourceView(Source, db.session, endpoint='source_admin'))
admin.add_view(WatchlistView(Watchlist, db.session, endpoint='watchlist_admin'))
admin.add_view(EntityView(Entity, db.session, endpoint='entity_admin'))
