"""Fix updated_at column to use ON UPDATE CURRENT_TIMESTAMP

Revision ID: 98777131a5dd
Revises: 0d2fae02a531
Create Date: 2026-01-09 06:39:44.700249

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98777131a5dd'
down_revision: Union[str, None] = '0d2fae02a531'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # documentsテーブルのupdated_atカラムにON UPDATE CURRENT_TIMESTAMPを追加
    # MySQLのON UPDATE CURRENT_TIMESTAMPを設定するため、直接SQLを実行
    op.execute("ALTER TABLE documents MODIFY updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")


def downgrade() -> None:
    # ON UPDATEを削除（元の状態に戻す）
    op.execute("ALTER TABLE documents MODIFY updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP")
