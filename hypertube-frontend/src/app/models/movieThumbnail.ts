import { Time } from "@angular/common";

export interface MovieThumbnail {
    id: number;
    title: string;
    watched: boolean;
    length: Time;
    visualizedTime: Time;
    release_year: number;
    img: string;
}
