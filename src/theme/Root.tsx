/**
 * 全局 Root 组件 — 客户端首次访问自动跳转到英文站。
 *
 * 行为：
 * 1. 首次访问（localStorage 无 'ct-locale-pref'）：如果不在 /en 路径下，
 *    自动跳转到对应 /en/... 路径，并把偏好设为 'en'。
 * 2. 用户主动切换 locale 时：根据当前 URL 前缀更新 localStorage
 *    （在 /en/* → 'en'，其他 → 'zh-Hans'），下次访问不再强制跳转。
 *
 * 这是纯客户端实现，不改变站点默认 locale（仍是 zh-Hans），
 * 因此现有中文 URL、外部书签、SEO 索引全部保留。
 */
import React from 'react';
import {useLocation} from '@docusaurus/router';

const PREF_KEY = 'ct-locale-pref';

function isEnPath(pathname: string): boolean {
    return pathname === '/en' || pathname.startsWith('/en/');
}

function targetEnPath(pathname: string): string {
    if (pathname === '/' || pathname === '') return '/en/';
    // 去除尾部斜杠后拼接，保持 URL 整洁
    const stripped = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return '/en' + stripped;
}

function useFirstVisitEnRedirect() {
    const location = useLocation();

    React.useEffect(() => {
        try {
            const path = location.pathname;
            const onEn = isEnPath(path);
            const pref = localStorage.getItem(PREF_KEY);

            // 首次访问（无偏好）：跳转到 /en
            if (pref === null) {
                if (!onEn) {
                    localStorage.setItem(PREF_KEY, 'en');
                    const target = targetEnPath(path);
                    if (target !== path) {
                        window.location.replace(target);
                        return;
                    }
                } else {
                    localStorage.setItem(PREF_KEY, 'en');
                }
                return;
            }

            // 已有偏好：根据当前 URL 同步偏好（响应用户主动切换 locale）
            localStorage.setItem(PREF_KEY, onEn ? 'en' : 'zh-Hans');
        } catch (e) {
            // localStorage 不可用（隐私模式）— 静默失败
        }
    }, [location.pathname]);
}

export default function Root({children}: {children: React.ReactNode}): React.JSX.Element {
    useFirstVisitEnRedirect();
    return <>{children}</>;
}
